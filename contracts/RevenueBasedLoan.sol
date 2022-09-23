// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RevenueBasedLoan is ERC721 {
    // Amount of Wei the borrower is asking
    uint256 public immutable loanAmount;

    // Fixed fee over the principal paid by the borrower for the service
    uint256 public immutable loanFee;

    // Amount of Wei already lent
    uint256 public fundedAmount;

    // Amount of Wei the borrower has withdrawn from the contract
    uint256 public withdrawnAmount;

    // Amount of Wei the borrower has already paid
    uint256 public paidAmount;

    // Percentage of monthly revenue the borrower will forward to pay for the loan
    // Two decimal points - Ex: 5.35% = 535
    uint8 public immutable payoutRate;

    // Number of loans that were emitted (NFTs minted). Serves as NFT id.
    uint64 public loansEmitted;

    // Timestamp of contract creation
    uint256 public immutable timeOfCreation;

    // Time in days for lending the required amount before the loan request gets deprecated
    uint256 public immutable daysToFill;

    // Address of the borrower
    address public immutable borrower;

    // URI of Borrower's Stripe data at the time of creation
    string public baseURI;

    // Tracks the amount lent per NFT id
    mapping(uint256 => uint256) public idToLoanAmount;

    // Tracks the amount of the loan re-payment withdrawn by a borrower
    mapping(uint256 => uint256) public idToWithdrawnAmount;

    event LoanPayment(uint256 value);

    event LenderWithdrawal(uint256 value, uint256 loanId, address lender);

    event BorrowerWithdrawal(uint256 value);

    modifier isActive() {
        require(fundedAmount == loanAmount, "Loan has not been filled yet");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 loanAmount_,
        uint8 payoutRate_,
        uint256 loanFee_,
        address borrower_,
        uint256 timeToFill_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        require(loanAmount_ > 0);
        require(payoutRate_ > 0 && payoutRate_ <= 10000);
        require(loanFee_ > 0);
        require(borrower_ == tx.origin);
        require(timeToFill_ > 0);
        require(bytes(baseURI_).length > 0);
        require(bytes(name_).length > 0);
        require(bytes(symbol_).length > 0);

        loanAmount = loanAmount_;
        payoutRate = payoutRate_;
        loanFee = loanFee_;
        borrower = borrower_;
        daysToFill = timeToFill_;
        timeOfCreation = block.timestamp;
        baseURI = baseURI_;
    }

    // Loans funds to the contract and mints an NFT certifying the loan
    function lend() public payable {
        require(
            msg.value + fundedAmount <= loanAmount,
            "Exceeding the available loan amount"
        );
        require(msg.value > 0, "Can't lend 0 wei");
        require(
            block.timestamp <= timeOfCreation + daysToFill * 24 * 3600,
            "Deprecated loan, not accepting deposits"
        );

        fundedAmount += msg.value;
        _mint(msg.sender, loansEmitted);
        idToLoanAmount[loansEmitted] = msg.value;

        loansEmitted++;
    }

    // Function for the borrower to pay part of the loan
    function payLoan() public payable isActive {
        require(msg.sender == borrower, "Not the borrower");
        require(
            paidAmount + msg.value <= loanAmount + loanFee,
            "Can't overpay the loan"
        );

        paidAmount += msg.value;

        emit LoanPayment(msg.value);
    }

    // Function for the borrower to withdraw the funds that were lent
    function withdrawBorrower(uint256 _amount) public isActive {
        require(
            msg.sender == borrower,
            "Not the borrower, can't withdraw funds"
        );
        require(
            withdrawnAmount + _amount <= fundedAmount,
            "Withdrawn funds exceed the total amount lent"
        );

        withdrawnAmount += _amount;
        (bool success, ) = borrower.call{value: _amount}("");
        require(success, "Failed to send the funds");

        emit BorrowerWithdrawal(_amount);
    }

    // Function for the lender to withdraw part of the funds and interests already settled
    function withdrawLender(uint256 _amount, uint256 _loanId) public isActive {
        require(
            msg.sender == ownerOf(_loanId),
            "Only the lender can withdraw the funds"
        );

        uint256 maxPayout = calculateSettledPayout(_loanId) -
            idToWithdrawnAmount[_loanId];
        require(
            _amount <= maxPayout,
            "Can't withdraw more than your percentage of the rapaid amount"
        );

        idToWithdrawnAmount[_loanId] += _amount;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Failed to send the funds");

        emit LenderWithdrawal(_amount, _loanId, msg.sender);
    }

    // Function for lenders to recover their funds if loan was not filled by the limit date
    function withdrawLenderDeprecatedLoan(uint256 _loanId) public {
        require(
            block.timestamp > timeOfCreation + daysToFill * 24 * 3600,
            "Have not reached deprecation timeout yet"
        );
        require(
            fundedAmount < loanAmount,
            "Loan has been filled and is active"
        );
        require(
            msg.sender == ownerOf(_loanId),
            "Only the lender can withdraw the funds"
        );
        require(
            idToLoanAmount[_loanId] - idToWithdrawnAmount[_loanId] > 0,
            "Already withdrawn funds"
        );

        idToWithdrawnAmount[_loanId] += idToLoanAmount[_loanId];
        (bool success, ) = msg.sender.call{
            value: idToLoanAmount[_loanId] - idToWithdrawnAmount[_loanId]
        }("");
        require(success, "Failed to send the funds");

        emit BorrowerWithdrawal(
            idToLoanAmount[_loanId] - idToWithdrawnAmount[_loanId]
        );
    }

    // Computes the total amount settled per loanId
    function calculateSettledPayout(uint256 _loanId)
        public
        view
        returns (uint256)
    {
        return ((paidAmount * idToLoanAmount[_loanId]) / fundedAmount); // Amount returned for that partial loan fill
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
