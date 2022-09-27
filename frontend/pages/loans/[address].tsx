import axios from "axios";
import LendModal from "components/lend-flow/LendModal";
import RepayClaim from "components/repay-flow/RepayClaim";
import Button from "components/ui/Button";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { Contract, ethers } from "ethers";
import { currencyFormat } from "lib/utils";
import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import { FiExternalLink } from "react-icons/fi";
import { BorrowLoanFormData, StripeReport } from "types";
import { useProvider, useSigner } from "wagmi";

type BorrowerMetadata = BorrowLoanFormData & { stripeReport: StripeReport } & {
  borrowerAddress: string;
  lends: number;
  amountFilled: number;
};

type Props = {
  loanAddress: string;
};

const LoanPage = ({ loanAddress }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lendModal, setLendModal] = useState<boolean>(false);
  const { data: signer } = useSigner();
  const [lender, setLender] = useState<any>(null);
  const provider = useProvider({ chainId: 8001 });
  const [metadata, setMetadata] = useState<any>({});

  useEffect(() => {
    getLoanData();
  }, [provider]);

  const getLoanData = async () => {
    setLoading(true);
    const loanContract = new ethers.Contract(loanAddress, NFT_ABI, provider);
    const metadataUri = await loanContract.baseURI();
    const borrowerAddress = await loanContract.borrower();
    // amount filled
    const filled = await loanContract.fundedAmount();
    // number of lenders
    const lends = await loanContract.loansEmitted();

    const metadataRes = await axios.get(
      metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
    );

    const metadata = metadataRes.data;
    setMetadata({
      ...metadata,
      borrowerAddress,
      lends: Number(lends.toString()),
      amountFilled: ethers.utils.formatEther(filled),
    });
    setLoading(false);
  };
  const handleLend = async (_value: number) => {
    try {
      if (!signer) throw new Error("Signer Not Found");

      const contract = new ethers.Contract(loanAddress, NFT_ABI, signer);
      const lendTx = await contract.lend({
        value: ethers.utils.parseEther(_value.toString()),
      });
      await lendTx.wait();
      return lendTx;
    } catch (err) {
      console.error(err);
    }
  };

  const checkIsLender = async () => {
    if (!signer) throw new Error("Signer Not Found");
    const address = await signer?.getAddress();
    const contract = new ethers.Contract(loanAddress, NFT_ABI, provider);
    // filter through transfer events
    const filterTransfer = contract.filters.Transfer(null, address, null);
    // const checkTx = await contract.lend();
    const query: any = await contract.queryFilter(filterTransfer);
    let lendNftsPromises = await query?.map(
      async (item: any, index: number) => {
        const id = item?.args[2].toString();
        const accRev = await contract.calculateSettledPayout(id);
        return { id, accRev: ethers.utils.formatEther(accRev) };
      }
    );
    const lendNfts = await Promise.all(lendNftsPromises);
    setLender(lendNfts);
    console.log(lendNfts);
  };

  const claimRepayment = async (amount: number, id: number) => {
    try {
      if (!signer) throw new Error("Signer Not Found");
      const contract = new ethers.Contract(loanAddress, NFT_ABI, signer);
      const claimTx = await contract.withdrawLender(ethers.utils.parseEther(amount.toString()),id.toString());
      await claimTx.wait();
      alert("Claim Successfull");
      window.location.reload();
    } catch (err) {
      alert(err);
      console.error(err);
    }
  };

  useEffect(() => {
    if (signer) {
      checkIsLender();
    }
  }, [signer]);

  if (loading)
    return (
      <div className="flex space-y-8 items-center justify-center py-28">
        <LoopingRhombusesSpinner color="rgb(59,130,240)" />
      </div>
    );
  return (
    <>
      <LendModal
        loanRequested={metadata?.amount}
        loanFilled={metadata?.amountFilled}
        borrowerAddress={metadata?.borrowerAddress}
        borrowerName={metadata?.name}
        isOpen={lendModal}
        setIsOpen={setLendModal}
        lendFunction={handleLend}
        loanAddress={loanAddress}
      />
      <div className="">
      <h2 className="font-semibold text-gray-600 text-xl mb-4">COMPANY DETAILS</h2>
         <div className="flex flex-wrap gap-4">
         <div className=" bg-white shadow rounded-xl p-6 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">COMPANY NAME</p>
            <p className="font-bold text-lg">{metadata?.name}</p>
          </div>
          <div className=" bg-white shadow rounded-xl p-6 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">EMAIL ADDRESS</p>
            <p className="font-medium text-lg">{metadata?.email}</p>
          </div>
          <div className=" bg-white shadow rounded-xl p-6 max-w-fit">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">COMPANY DESCRIPTION</p>
            <p className="font-medium text-lg">{metadata?.description}</p>
          </div> 
         
          {metadata?.website && (
            <div className="bg-white shadow rounded-xl p-6">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">OFFICIAL WEBSITE</p>
            <a
              href={metadata?.website}
              target="_blank"
              rel="noreferrer"
              className="flex gap-2 items-center font-medi underline underline-offset-4 text-lg cursor-pointer "
              >
              {metadata?.website} <FiExternalLink />
            </a>
              </div>
          )}
         
          </div>
          
      
      <h2 className="font-semibold text-gray-600 text-xl mt-8 mb-4">LOAN DETAILS</h2>
        <div className="flex items-center gap-4">
         
          <div className=" bg-white shadow rounded-xl p-4 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">LOAN REQUESTED</p>
            <p className="font-medium text-lg">{metadata?.amount} MATIC</p>
          </div>
          <div className=" bg-white shadow rounded-xl p-4 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">Revenue</p>
            <p className="font-medium text-lg text-emerald-500">
              {currencyFormat(metadata?.stripeReport?.activity)} EUR
            </p>
          </div>
          <div className=" bg-white shadow rounded-xl p-4 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">Amount Filled</p>
            <p className="font-medium text-lg ">
              {(metadata?.amountFilled / metadata?.amount) * 100} %
            </p>
          </div>

          <div className=" bg-white shadow rounded-xl p-4">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">Interest Rate</p>
            <p className="font-medium text-lg">10%</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 ">
            <p className="uppercase font-medium text-sm text-gray-400 mb-1">Number of Lenders</p>
            <p className="font-medium text-lg">{metadata?.lends || 0}</p>
          </div>
          {/* <div className="border-l-2 pl-8 py-2 ">
          <p className="uppercase text-gray-500 mb-1">Status</p>
          <p className="font-medium text-lg text-emerald-600">Active</p>
        </div> */}
        </div>
      
            {lender?.length > 0 && (
              <RepayClaim data={lender} claimRepayment={claimRepayment} />
            )}
          <div className=" gap-4 mt-8 justify-end">
            <Button
              onClick={() => setLendModal(true)}
              size="lg"
              variant="primary"
              >
              Lend
            </Button>
          </div>
        </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const loanAddress = context?.params?.address as string;

  return {
    props: {
      loanAddress,
    },
  };
};

export default LoanPage;
