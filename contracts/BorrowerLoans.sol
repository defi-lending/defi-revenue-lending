// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./RevenueBasedLoan.sol";

contract BorrowerLoans {
    address[] public borrowers;
    mapping(address => address) public loanRequestAddresses;
    event LoanRequestCreation(
        address indexed borrower,
        address loanRequest,
        string baseURI
    );

    function createBorrowerLoan(
        uint256 loanAmount_,
        uint16 payoutRate_, // Percentage of monthly revenue towards repayment. Two decimal points - Ex: 5.35% = 535
        uint256 loanFee_,
        string memory baseURI_
    ) public returns (bool) {
        require(
            loanRequestAddresses[msg.sender] == address(0),
            "Borrower already published a request"
        );
        require(loanAmount_ > 0, "Loan amount can't be 0");
        require(
            payoutRate_ > 0 && payoutRate_ <= 10000,
            "Can't pay 0% nor above 100% of revenue"
        );
        require(loanFee_ > 0, "Loan fee has to be greater than 0");
        require(bytes(baseURI_).length > 0, "baseURI must be non-empty");

        RevenueBasedLoan loanRequest = new RevenueBasedLoan(
            "Revenue Based Loan",
            "RBL",
            loanAmount_,
            payoutRate_,
            loanFee_,
            msg.sender,
            7, // loan has to be filled within a week
            baseURI_
        );
        borrowers.push(msg.sender);
        loanRequestAddresses[msg.sender] = address(loanRequest);

        emit LoanRequestCreation(msg.sender, address(loanRequest), baseURI_);
        return true;
    }

    function getAllBorrowers() external view returns (address[] memory) {
        return borrowers;
    }

    function getAllBorrowerLoanRequests()
        external
        view
        returns (address[] memory)
    {
        address[] memory borrowerReqs = new address[](borrowers.length);

        for (uint256 idx = 0; idx < borrowers.length; idx++) {
            borrowerReqs[idx] = loanRequestAddresses[borrowers[idx]];
        }

        return borrowerReqs;
    }
}
