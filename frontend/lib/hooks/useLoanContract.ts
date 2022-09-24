import axios from "axios";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import { useState } from "react";
import { useContract, useProvider, useSigner } from "wagmi";

const useLoanContract = (loanAddress:string) => {
  const [loading,setLoading] = useState<boolean>(false)

  const { data: signer } = useSigner();
  const provider = useProvider({ chainId: 8001 });

  // instance of borrow contract
  const loanContract = useContract({
    addressOrName: loanAddress,
    contractInterface: NFT_ABI,
    signerOrProvider: signer || provider,
  });
  
  return {loanContract};
};

export default useLoanContract;
