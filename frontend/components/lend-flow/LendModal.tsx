import Button from "components/ui/Button";
import Modal, { ModalHeader } from "components/ui/Modal";
import React, { Dispatch, SetStateAction, useState } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  borrowerAddress: string | number;
  borrowerName: string;
  loanRequested: number;
  loanFilled: number;
};



const LendModal = ({
  isOpen,
  setIsOpen,
  borrowerAddress,
  loanFilled,
  loanRequested,
  borrowerName,
}: Props) => {
  const [fillValue, setFillValue] = useState<number>(0);
  const [steps,setSteps]
  const closeModal = () => {
    setIsOpen(false);
  };

  const availableToFill = loanRequested - loanFilled;
  const currency = "MATIC"
  const handleLendRequest = () => {};

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} size="sm">
      <ModalHeader className="text-xl mb-4 font-medium text-gray-700">
        Lend {borrowerName}
      </ModalHeader>
      <div className="space-y-4">
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Borrower Address :
          </div>
          <div className="text-sm text-gray-500">
            {borrowerAddress}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Loan Requested :
          </div>
          <div className="text-sm text-gray-500">{loanRequested} {currency}</div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            Available amount to fill :
          </div>
          <div className="text-sm text-gray-500">
            {availableToFill?.toFixed(2)}{" "}{currency}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-medium text-sm">
            You will be repayed
          </div>
          <div className="text-sm text-gray-500">
            {(fillValue * 1.1).toFixed(2)}{" "}{currency}
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p>Lend Amount </p>
            <p>{fillValue.toFixed(2)}{" "}{currency}</p>
            </div>
            <input
              onChange={(e) => setFillValue(Number(e.target.value))}
              value={fillValue}
              type="range"
              min={0}
              max={availableToFill}
              step={availableToFill / 10}
              className="w-full"
            />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleLendRequest} variant="primary">
            Confirm Lend
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LendModal;
