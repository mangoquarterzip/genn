export const OracleAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_validators",
        type: "address[]",
        internalType: "address[]",
      },
      { name: "_chainHash", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chainHash",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestNumber",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "highestNonce",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "randomNumbers",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "submit",
    inputs: [
      { name: "_chainHash", type: "uint256", internalType: "uint256" },
      { name: "number", type: "uint256", internalType: "uint256" },
      { name: "nonce", type: "uint256", internalType: "uint256" },
      { name: "signatures", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "RandomNumberSubmitted",
    inputs: [
      {
        name: "nonce",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "number",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "ECDSAInvalidSignature", inputs: [] },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [{ name: "length", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [{ name: "s", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "InsufficientSignatures",
    inputs: [
      { name: "required", type: "uint256", internalType: "uint256" },
      { name: "provided", type: "uint256", internalType: "uint256" },
    ],
  },
  { type: "error", name: "InvalidChainHash", inputs: [] },
  { type: "error", name: "RepeatedNonce", inputs: [] },
  { type: "error", name: "Unauthorized", inputs: [] },
] as const;
