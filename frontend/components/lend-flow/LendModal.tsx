import Button from "components/ui/Button";
import Modal, { ModalHeader } from "components/ui/Modal";
import Tooltip from "components/ui/Tooltip";
import React, { Dispatch, SetStateAction, useState } from "react";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  borrowerAddress: string | number;
  borrowerName: string;
  loanRequested: number;
  loanAddress: string;
  lendFunction: any;
  loanFilled: number;
};

const LendModal = ({
  isOpen,
  setIsOpen,
  borrowerAddress,
  loanFilled,
  loanRequested,
  borrowerName,
  loanAddress,
  lendFunction,
}: Props) => {
  const [fillValue, setFillValue] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [tx, setTx] = useState<any>(null);

  const closeModal = () => {
    };

  const availableToFill = loanRequested - loanFilled;
  const currency = "MATIC";

  const handlePayInCrypto = async () => {
    setProcessing(true);
    try {
      if (fillValue == 0) {
        alert("Lend amount cannot be 0");
        return;
      }
      const lendTx = await lendFunction(fillValue);
      setTx(lendTx)
      console.log(lendTx);
    } catch (err) {
      alert(err);
      console.error(err);
    }
    setProcessing(false);
  };

  const handlePayViaPlaid = () => {
    alert("under development");
  };
  

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} size="sm">
      <ModalHeader className="text-xl mb-4 font-medium text-gray-700">
        Lend {borrowerName}
      </ModalHeader>
      {processing && (<div className="flex flex-col gap-4 items-center justify-center py-16">
      <LoopingRhombusesSpinner color="rgb(59,130,240)" />
      <p className="animate-pulse">Processing Transaction ...</p>
    </div>)}
      {!processing && tx && (<div className="flex flex-col gap-4 justify-center ">
      <p className="text-xl text-medium text-emerald-500">
        Transaction Successfull
      </p>
      <div>
        <div className="text-gray-600 font-medium text-sm">
          Transaction Hash:
        </div>
        <a target={"_blank"} rel='noreferrer' href={`https://mumbai.polygonscan.com/address/${tx?.hash}`} className="text-sm flex items-center gap-2 text-blue-500 hover:underline underline-offset-4">View on etherscan <FiExternalLink/></a>
      </div>
      <div>
        <div className="text-gray-600 font-medium text-sm">
          Loan Contract:
        </div>
        <a target={"_blank"} rel='noreferrer' href={`https://mumbai.polygonscan.com/address/${loanAddress}`} className="text-sm flex items-center gap-2 text-blue-500 hover:underline underline-offset-4">{loanAddress} <FiExternalLink/></a>
      </div>
      <Button onClick={()=>window.location.reload()}>Okay</Button>
    </div>)}
      {!processing && !tx &&(

        <div className="space-y-4">
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Borrower Address :
          </div>
          <div className="text-sm text-gray-500">{borrowerAddress}</div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Loan Requested :
          </div>
          <div className="text-sm text-gray-500">
            {loanRequested} {currency}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Available amount to fill :
          </div>
          <div className="text-sm text-gray-500">
            {availableToFill?.toFixed(2)} {currency}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            You will be repayed
          </div>
          <div className="text-sm text-gray-500">
            {(fillValue * 1.1).toFixed(2)} {currency}
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p>Lend Amount </p>
            <p>
              {fillValue.toFixed(2)} {currency}
            </p>
          </div>
          <input
            onChange={(e) => setFillValue(Number(e.target.value))}
            value={fillValue}
            type="range"
            min={0}
            max={availableToFill}
            step={availableToFill / 20}
            className="w-full"
            />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={closeModal}>Cancel</Button>
          <Tooltip
            className="tex-center max-w-fit"
            content="Pay in crypto directly from your connected crypto wallet "
            >
            <Button onClick={handlePayInCrypto} variant="success">
              Pay in crypto
            </Button>
          </Tooltip>
          <Tooltip content="Pay directly from your bank through Plaid">
            <Button onClick={handlePayViaPlaid} variant="primary">
              Pay via Plaid
            </Button>
          </Tooltip>
        </div>
      </div>
        )}
    </Modal>
  );
};

export default LendModal;
