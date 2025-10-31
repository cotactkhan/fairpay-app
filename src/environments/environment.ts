// export const environment = {
//   production: false,
//     contractAddress: '0xB78A0159f59195b3b95C4AdD75bA024753e015f0',
//   relayerUrl: 'https://relayer.sepolia.zama.ai',
//   chainId: 11155111,
//   rpcUrl: 'https://rpc.sepolia.org'
// };

export const environment = {
  production: true,
  // contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    contractAddress: '0xB78A0159f59195b3b95C4AdD75bA024753e015f0',
  localRpcUrl: 'http://localhost:8545',
  localChainId: 31337,
  localProvider:false,
  localPrivateKey:
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Example: Hardhat's default Account #0 private key
    

  relayerUrl: 'https://relayer.sepolia.zama.ai',
  chainId: 11155111,
  rpcUrl: 'https://rpc.sepolia.org',
};
