export const BORROW_CONTRACT_ADDRESS = "0xEF0A4651FadDe448C70aCAB02664D80060E7E1C4"
export const BORROW_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanAmount_",
				"type": "uint256"
			},
			{
				"internalType": "uint16",
				"name": "payoutRate_",
				"type": "uint16"
			},
			{
				"internalType": "uint256",
				"name": "loanFee_",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "baseURI_",
				"type": "string"
			}
		],
		"name": "createBorrowerLoan",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "loanRequest",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "baseURI",
				"type": "string"
			}
		],
		"name": "LoanRequestCreation",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "borrowers",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllBorrowerLoanRequests",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllBorrowers",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "loanRequestAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]