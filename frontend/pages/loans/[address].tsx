import axios from "axios";
import LendModal from "components/lend-flow/LendModal";
import Button from "components/ui/Button";
import Heading from "components/ui/Heading";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { ethers } from "ethers";
import useLoanContract from "lib/hooks/useLoanContract";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { chain } from "wagmi";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const LoanPage = ({metadata}: Props) => {
  const [lendModal,setLendModal] = useState<boolean>(false);
  return (
    <>
    <LendModal borrowerId={1} borrowerName={"<CompanyName here>"} isOpen={lendModal} setIsOpen={setLendModal}  />
    <div className="">
      <div className="flex   items-center gap-8">
        <img
          className="w-20 h-20 rounded-full object-cover object-center"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80"
          alt="image"
          />
        <div>
          <p className="uppercase text-gray-500 mb-1">Borrower</p>
          <p className="font-medium text-lg">Company </p>
        </div>
        <div className="border-l-2 pl-8 py-2 ">
          <p className="uppercase text-gray-500 mb-1">Revenue</p>
          <p className="font-medium text-lg">$100k</p>
        </div>
        <div className="border-l-2 pl-8 py-2 ">
          <p className="uppercase text-gray-500 mb-1">Interest Rate</p>
          <p className="font-medium text-lg">10-12%</p>
        </div>
        <div className="border-l-2 pl-8 py-2 ">
          <p className="uppercase text-gray-500 mb-1">Status</p>
          <p className="font-medium text-lg text-emerald-600">Active</p>
        </div>
      </div>
      <div className="">
        <h2 className="mt-8 mb-4 text-2xl font-medium text-gray-800 ">
          Borrower Overview
        </h2>
        <h6 className="uppercase mb-2 text-gray-500 font-medium">
          Buisness Description
        </h6>
        <p className="text-gray-800 ">
       {}
        </p>
        <h6 className="uppercase mt-4 mb-2  text-gray-500 font-medium">
          Links
        </h6>
        <div className="space-y-2">
          <a
            href="#"
            className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
          >
            Official Website <FiExternalLink />
          </a>
          <a
            href="#"
            className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
            >
            Twitter <FiExternalLink />
          </a>
          <a
            href="#"
            className="flex gap-2 items-center hover:underline underline-offset-4 cursor-pointer "
          >
            LinkedIn <FiExternalLink />
          </a>
        </div>
        <div className="flex items-center gap-4 justify-end">
          <Button size="lg">Message</Button>
          <Button onClick={()=>setLendModal(true)} size="lg" variant="primary">
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

  const loanContract = new ethers.Contract(loanAddress,NFT_ABI,provider);
  const metadataUri = await loanContract.baseURI();
  const metadataRes = await axios.get(metadataUri.replace("ipfs://","https://ipfs.io/ipfs/"))
  const metadata = metadataRes.data
  return {
    props: {
      metadata
    }
  }

}

export default LoanPage;
