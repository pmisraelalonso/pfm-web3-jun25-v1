import SupplyChainABI from './SupplyChainABI.json';

export const CONTRACT_CONFIG = {
  // Update this address after deploying to Anvil
  address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Deployed on Nov 25, 2025
  abi: SupplyChainABI,
  adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // First Anvil account
};

export const NETWORK_CONFIG = {
  chainId: 31337, // Anvil local chain
  chainName: "GoChain Testnet",
  rpcUrl: "http://localhost:8545",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

export const ANVIL_ACCOUNTS = {
  admin: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  producer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  factory: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  retailer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  consumer: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
};
