import {
  BORROW_CONTRACT_ABI,
  BORROW_CONTRACT_ADDRESS,
} from "contracts/borrowContracts";
import { useContract, useProvider, useSigner } from "wagmi";

const useBorrowContract = () => {
  const { data: signer } = useSigner();
  const provider = useProvider({ chainId: 8001 });

  const borrowContract = useContract({
    addressOrName: BORROW_CONTRACT_ADDRESS,
    contractInterface: BORROW_CONTRACT_ABI,
    signerOrProvider: signer || provider,
  });

  const createBorrowRequest = async() => {
    
  }

  return {};
};

export default useBorrowContract;
