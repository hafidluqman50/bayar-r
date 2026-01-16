export const paylinkAbi = [
  {
    type: "function",
    name: "createPaylink",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "expiryDays", type: "uint256" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "pay",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getPaylink",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "note", type: "string" },
          { name: "paid", type: "bool" },
          { name: "payer", type: "address" },
          { name: "paidAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "nextId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "PaylinkCreated",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "expiry", type: "uint256" },
      { indexed: false, name: "note", type: "string" },
    ],
  },
  {
    type: "event",
    name: "PaylinkPaid",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "payer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "paidAt", type: "uint256" },
    ],
  },
] as const
