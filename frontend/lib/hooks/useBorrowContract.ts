import axios from "axios";
import {
  BORROW_CONTRACT_ABI,
  BORROW_CONTRACT_ADDRESS,
} from "contracts/borrowContracts";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { Contract, ethers } from "ethers";
import { useContract, useProvider, useSigner } from "wagmi";

const useBorrowContract = () => {
  const INTEREST_RATE = 0.1; // Fixed at 10% for now
  const { data: signer } = useSigner();
  const provider = useProvider({ chainId: 8001 });

  // instance of borrow contract
  const borrowContract: Contract = useContract({
    addressOrName: BORROW_CONTRACT_ADDRESS,
    contractInterface: BORROW_CONTRACT_ABI,
    signerOrProvider: signer || provider,
  });

  const createBorrowRequest = async (_loanAmount: number, metadata: object) => {
    try {
      if (!signer) throw new Error("Wallet not connected");
      // createBorrowerLoan(loanAmount,payoutRate,loanFee,baseUri)
      const payoutRate = 1000; // for 10%
      const loanFee = ethers.utils.parseEther(
        Number(_loanAmount * INTEREST_RATE).toString()
      );
      const loanAmount = ethers.utils.parseEther(_loanAmount.toString());
      // store the metadata to ipfs and get cid
      console.log("uploading metadata");
      const metadataRes = await axios.post("/api/upload-metadata", {
        metadata,
      });
      console.log("Metadata uploaded successfully", { data: metadataRes.data });

      if (!metadataRes.data) throw new Error("Failed to upload metadata");
      const metadataUri = metadataRes.data.uri;

      // create borrower loan request nft
      console.log("Creating Metadata");
      const tx = await borrowContract.createBorrowerLoan(
        loanAmount,
        payoutRate,
        loanFee,
        metadataUri
      );
      await tx.wait();
      console.log("Loan Request created Successfully", { tx });
    } catch (err) {
      console.error(err);
    }
  };
  const getAllBorrowers = async () => {
    try {
      //  Get all LoanRequestCreation events
      const loanAddresses = await borrowContract.getAllBorrowerLoanRequests();
      let promises = await loanAddresses.map(async (address: string) => {
        const loanContract = new ethers.Contract(address, NFT_ABI, provider);
        const metadataUri = await loanContract.baseURI();
        // const borrowerAddress = await loanContract.borrower();
        const loanFilled = await loanContract.fundedAmount();
        // get the actual metadata object from uri
        const metadataRes = await axios.get(
          metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
        );
        if(metadataRes.data){
          return {...metadataRes.data,loanAddress:address,loanFilled}
        }
      });
      const loanRequests = await Promise.all(promises)
      return loanRequests;
    } catch (err) {
      console.error(err);
    }
  };

  const getLoanAddress = async (borrowerAddress:string) => {
    const loanAddress = await borrowContract.loanRequestAddresses(borrowerAddress)
    return loanAddress;
  }

  return { createBorrowRequest, getAllBorrowers ,getLoanAddress};
};

export default useBorrowContract;
