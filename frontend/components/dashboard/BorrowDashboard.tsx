import axios from "axios";
import Button from "components/ui/Button";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { Contract, ethers } from "ethers";
import useBorrowContract from "lib/hooks/useBorrowContract";
import React, { useEffect, useState } from "react";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import { useAccount, useSigner,  } from "wagmi";

type Props = {};

const BorrowDashboard = (props: Props) => {
  const { address } = useAccount();
  const [loan, setLoan] = useState<any>({});
  const { getLoanAddress } = useBorrowContract();
  const [loading, setLoading] = useState<boolean>(false);
  const [loanContract, setLoanContract] = useState<Contract>({} as Contract);
  const { data: signer } = useSigner();
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [repayLoading, setRepayLoading] = useState<boolean>(false);
  const [repayAmount, setRepayAmount] = useState<number>(0);

  if (!address || !loan) {
    return <div></div>;
  }

  useEffect(() => {
    if (signer) {
      (async () => {
        setLoading(true);
        const loanAddress = await getLoanAddress(address);
        console.log(loanAddress);

        const loanContract = new ethers.Contract(loanAddress, NFT_ABI, signer);
        setLoanContract(loanContract);

        if (loanAddress) {
          const metadataURI = await loanContract.baseURI();
          //amount already filled
          let filledInWei = await loanContract.fundedAmount();
          const filledAmount = ethers.utils.formatEther(filledInWei);
          // number of lenders
          let lends = await loanContract.loansEmitted();
          lends = lends.toString();
          // total amont repayed to lenders
          let repaidAmount = await loanContract.paidAmount();
          repaidAmount = ethers.utils.formatEther(repaidAmount);
          // amount withdrawn by the owner
          let withdrawnAmount = await loanContract.withdrawnAmount();
          withdrawnAmount = ethers.utils.formatEther(withdrawnAmount);

          const { data: metadata } = await axios.get(
            metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/")
          );

          setLoan({
            ...metadata,
            loanAddress,
            filledInWei,
            filledAmount,
            lends,
            repaidAmount,
            withdrawnAmount,
          });
          console.log(loan);
        }
        setLoading(false);
      })();
    }
  }, [signer]);

  const handleRepay = async () => {
    setRepayLoading(true);
    try {
      const repayTx = await loanContract.payLoan({
        value: ethers.utils.parseEther(repayAmount.toString()),
      });
      await repayTx.wait();
      alert("Repayment Successfull");
    } catch (err) {
      alert(err);
      console.error(err);
    }
    setRepayLoading(false);
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      console.log(loan?.filledInWei);
      const tx = await loanContract.withdrawBorrower(loan?.filledInWei);
      await tx.wait();
      console.log(tx);
      alert("withdraw successfull");
    } catch (err) {
      alert("Loan has not been filled");
      console.log(err);
    }
    setWithdrawLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoopingRhombusesSpinner color="rgb(59,130,240)" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white border rounded-lg p-6">
        <h6 className="text-xl font-bold mb-4">{loan?.name}</h6>
        <div className="mb-2  ">
          <p className="font-medium text-gray-500 text-sm">
            Loan Contract Address :
          </p>
          <p>{loan?.loanAddress}</p>
        </div>
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">Loan Requested : </p>
          <p>{Number(loan?.amount)?.toFixed(2)} MATIC</p>
        </div>{" "}
        <div className="mb-2">
          <p className="font-medium text-sm text-gray-500 ">Loan Filled :</p>
          <p>
            {Number(loan?.filledAmount).toFixed(2)} / {Number(loan?.amount).toFixed(2)} MATIC
          </p>
        </div>
        <Button variant="success" className="mt-4" loading={withdrawLoading} onClick={handleWithdraw}>
          {" "}
          Withdraw funds
        </Button>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
            Repayable Amount :
          </p>
          <p>{Number(loan?.amount * 1.1).toFixed(2)} MATIC</p>
        </div>
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
            Total number of lenders:
          </p>
          <p>{loan?.lends} LENDERS</p>
        </div>
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
            Total Repaid Amount :{" "}
          </p>
          <p>
            {Number(loan?.repaidAmount).toFixed(2)} / {Number((loan?.amount * 1.1)).toFixed(2)}MATIC
          </p>
        </div>{" "}
        <div className="mb-2">
          <p className="font-medium text-sm text-gray-500 ">
            Total Withdrawn Amount :{" "}
          </p>
          <p>{loan?.withdrawnAmount} MATIC</p>
          <div className="flex items-center border-t pt-2 mt-2 justify-between">
            <label className="flex flex-col gap-2">
              Repay : {repayAmount} MATIC
              <input
                value={repayAmount}
                onChange={(e) => setRepayAmount(Number(e.target.value))}
                step={(Number(loan?.filledAmount) / 10).toFixed(2)}
                type="range"
                min={0}
                max={Number(loan?.filledAmount*1.1 - loan?.repaidAmount ).toFixed(2)}
              />
            </label>
            <Button
              variant="primary"
              className="mt-4"
              loading={repayLoading}
              onClick={handleRepay}
            >
              Repay Lenders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowDashboard;
