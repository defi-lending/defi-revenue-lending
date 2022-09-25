import axios from "axios";
import LendModal from "components/lend-flow/LendModal";
import Button from "components/ui/Button";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { Contract, ethers } from "ethers";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { BorrowLoanFormData, StripeReport } from "types";
import { chain, useSigner } from "wagmi";

type BorrowerMetadata = BorrowLoanFormData & { stripeReport: StripeReport } & {
  borrowerAddress: string;
  lends: number;
  amountFilled: number;
};

type Props = {
  metadata: BorrowerMetadata;
  loanContract:Contract
  loanAddress:string 
};



const LoanPage = ({ metadata , loanAddress }: Props) => {
  const [lendModal, setLendModal] = useState<boolean>(false);
  console.log({ metadata });
  const {data:signer} = useSigner();

  const handleLend =async (_value:number) => {
    try{
      if(!signer) throw new Error("Signer Not Found")

      const contract = new ethers.Contract(loanAddress,NFT_ABI,signer) ;
      const lendTx = await contract.lend({value:ethers.utils.parseEther(_value.toString())})
      await lendTx.wait();
      return lendTx;
      
    }catch(err){
      console.error(err)
    }
  }
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
        <div className="flex   items-center gap-8">
          {/* <img
          className="w-20 h-20 rounded-full object-cover object-center"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80"
          alt="image"
          /> */}
          <div className=" py-2 ">
            <p className="uppercase text-gray-500 mb-1">LOAN REQUESTED</p>
            <p className="font-medium text-lg">{metadata?.amount} MATIC</p>
          </div>
          <div className="border-l-2 pl-8 py-2 ">
            <p className="uppercase text-gray-500 mb-1">Revenue</p>
            <p className="font-medium text-lg text-emerald-500">
              {metadata?.stripeReport?.activity.toFixed(2)} EUR
            </p>
          </div>
          <div className="border-l-2 pl-8 py-2 ">
            <p className="uppercase text-gray-500 mb-1">Number of Lenders</p>
            <p className="font-medium text-lg">{metadata?.lends || 0}</p>
          </div>
          <div className="border-l-2 pl-8 py-2 ">
            <p className="uppercase text-gray-500 mb-1">Amount Filled</p>
            <p className="font-medium text-lg ">
              {(metadata?.amountFilled/metadata?.amount)*100} %
            </p>
          </div>

          <div className="border-l-2 pl-8 py-2 ">
            <p className="uppercase text-gray-500 mb-1">Interest Rate</p>
            <p className="font-medium text-lg">10%</p>
          </div>
          {/* <div className="border-l-2 pl-8 py-2 ">
          <p className="uppercase text-gray-500 mb-1">Status</p>
          <p className="font-medium text-lg text-emerald-600">Active</p>
        </div> */}
        </div>
        <div className="border-t py-4">
          <p className="text-2xl font-semibold">{metadata?.name}</p>
          <p className="text-gray-800 ">
            Email : <em>{metadata?.email}</em>
          </p>
          <p className="text-gray-800 ">
            Address : <em>{metadata?.borrowerAddress}</em>
          </p>
          <h6 className="uppercase mb-2 mt-4 text-gray-500 font-medium">
            Buisness Description
          </h6>
          <p className="text-gray-800 ">{metadata?.description}</p>
          <h6 className="uppercase mt-4 mb-2  text-gray-500 font-medium">
            Links
          </h6>
          <div className="space-y-2">
            {metadata?.website && (
              <a
                href={metadata?.website}
                target="_blank"
                rel="noreferrer"
                className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
              >
                Official Website <FiExternalLink />
              </a>
            )}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
            >
              Twitter <FiExternalLink />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
            >
              LinkedIn <FiExternalLink />
            </a>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <Button
              onClick={() => setLendModal(true)}
              size="lg"
              variant="primary"
            >
              Lend
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const loanAddress = context?.params?.address as string;

  const provider = new ethers.providers.AlchemyProvider(
    chain.polygonMumbai.id,
    process.env.ALCHEMY_KEY
  );

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
  return {
    props: {
      metadata: {
        ...metadata,
        borrowerAddress,
      
        lends: Number(lends.toString()),
        amountFilled: ethers.utils.formatEther(filled),
      },
      loanAddress
    },
  };
};

export default LoanPage;