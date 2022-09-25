import axios from "axios";
import Button from "components/ui/Button";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { Contract, ethers } from "ethers";
import { TransactionTypes } from "ethers/lib/utils";
import useBorrowContract from "lib/hooks/useBorrowContract";
import useLoanContract from "lib/hooks/useLoanContract";
import React, { useEffect, useState } from "react";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import { useAccount, useSigner, useSignMessage } from "wagmi";

type Props = {};

const BorrowDashboard = (props: Props) => {
  const { address } = useAccount();
  const [loan, setLoan] = useState<any>({});
  const { getLoanAddress } = useBorrowContract();
  const [loading, setLoading] = useState<boolean>(false);
  const [loanContract, setLoanContract] = useState<Contract>({} as Contract);
  const { data: signer } = useSigner();
  const [withdrawoading,setWithdrawLoading] = useState<boolean>(false);
  const [repayLoading,setRepayLoading] = useState<boolean>(false);

  


  if (!address) {
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
          let repayedAmount = await loanContract.paidAmount();
          repayedAmount = ethers.utils.formatEther(repayedAmount);
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
            repayedAmount,
            withdrawnAmount,
          });
          console.log(loan);
        }
        setLoading(false);
      })();
    }
  }, [signer]);

  const handleRepay = async (amount:number) => {
    setRepayLoading(true)
    try{
      const repayTx = await loanContract.payLoan(amount)
      await repayTx.wait();
      alert('Repayment Successfull')
    } catch (err){
        console.error(err)
    }
    setRepayLoading(false)
  }

  const handleWithdraw = async  () => {
    setWithdrawLoading(true)
    try{
      console.log(loan?.filledInWei)
      const tx = await loanContract.withdrawBorrower(loan?.filledInWei)
      await tx.wait()
      console.log(tx);
      alert("withdraw successfull")
    }catch(err){
      alert('Loan has not been filled')
      console.log(err)
    }
    setWithdrawLoading(false) 
  }
  
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
            {Number(loan?.filledAmount).toFixed(2)} / {loan?.amount} MATIC
          </p>
        </div>
        <Button variant="success" className="mt-4" onClick={handleWithdraw}> Withdraw funds</Button>
      </div>

      <div className="bg-white border rounded-lg p-6">
      <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
           Repayable Amount : 
          </p>
          <p>{loan?.amount * 1.1} MATIC</p>
        </div>
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
            Total number of lenders:
          </p>
          <p>{loan?.lends} LENDERS</p>
        </div>
        <div className="mb-2 ">
          <p className="font-medium text-gray-500 text-sm">
            Total Repayed Amount :{" "}
          </p>
          <p>{loan?.repayedAmount} / {loan?.amount*1.1}MATIC</p>
        </div>{" "}
        <div className="mb-2">
          <p className="font-medium text-sm text-gray-500 ">
            Total Withdrawn Amount :{" "}
          </p>
          <p>
            {loan?.withdrawnAmount} MATIC 
          </p>
          <Button variant="primary" className="mt-4" loading={repayLoading} >Repay Lenders</Button>
        </div>
      </div>
    </div>
  );
};

export default BorrowDashboard;
