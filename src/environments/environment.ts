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
    // contractAddress: '0xB78A0159f59195b3b95C4AdD75bA024753e015f0',  // works on sepolia till submitEmployerRange but has other issues after that
    // contractAddress: '0x2DE0Abd67F4aDC6F2e500BdFb56409B46ED5A178',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0x2472dB9B90278124f97516a109DD592E75Ea9097',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0x61Eb982F8606F7BB654124b926c51ba0a68Ef538',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0x5057d72853e46011B2b9B2cc32BeCDa48d6856C6',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0xcfb498BB46C591Ab72251eeB29E7D8dD4B985163',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0x3F15b91Ddd7f922aE144873F7851Eb906eB570CE',  // deployed on sepolia removing validate callbacks 
    // contractAddress: '0xA939dF24904a7949ecC6867D8746E6df7357C7B5',  // deployed on sepolia removing validate callbacks 
    contractAddress: '0x08bc1b32b537a8E2F678ef95D7847255d40216Dd',  // deployed on sepolia removing validate callbacks 

  localRpcUrl: 'http://localhost:8545',
  localChainId: 31337,
  localProvider:false,
  localPrivateKey:
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Example: Hardhat's default Account #0 private key
    

  relayerUrl: 'https://relayer.sepolia.zama.ai',
  chainId: 11155111,
  rpcUrl: 'https://rpc.sepolia.org',
};
