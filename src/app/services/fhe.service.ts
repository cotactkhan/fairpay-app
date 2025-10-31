import { Injectable } from '@angular/core';
      // const mymodule = require('./mylib.js');


// import {
//   createInstance,
//   FhevmInstance,
//   SepoliaConfig,
// } from '@zama-fhe/relayer-sdk/web';

// import { initSDK, createInstance, SepoliaConfig, FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import { SepoliaConfig, createInstance } from '@zama-fhe/relayer-sdk/bundle';

@Injectable({
  providedIn: 'root',
})
export class FheService {
  // private instance: FhevmInstance | null = null;
  private instance: any | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // const { initSDK, createInstance, SepoliaConfig } = await import(
      //   '@zama-fhe/relayer-sdk/bundle'
      // );

      this.instance = await createInstance(SepoliaConfig);

      // //  const { createInstance, SepoliaConfig  } = await import(
      // //   '@zama-fhe/relayer-sdk/bundle'
      // // );

      //  await initSDK();
      //   this.instance = await createInstance(SepoliaConfig);

      // const fheModule = await import('@zama-fhe/relayer-sdk/bundle');
              // this.instance = await fheModule.createInstance(fheModule.SepoliaConfig);
      // console.log('FHE module keys:', Object.keys(fheModule));

      // console.log("0")
      // const mymodule = await import('./mylib.js');
      // await mymodule.initSDK();

      // console.log("1");
  //     if (!fheModule || !fheModule.initSDK) {
  //   throw new Error('Failed to load Zama SDK module or initSDK is missing.');
  // }

      // 2. Access the exported functions and configuration from the module object.
      // await fheModule.initSDK();
      console.log("2");
      // this.instance = await fheModule.createInstance(fheModule.SepoliaConfig);

      console.log('FHE initialized');
      // console.log('✅ Zama SDK ready:', this.instance);

      this.initialized = true;
      console.log('FHE initialized');
    } catch (error) {
      console.error('FHE init failed:', error);
      throw error;
    }
  }

  async encryptRange(
    minSalary: number,
    maxSalary: number,
    userAddress: string,
    contractAddress: string
  ): Promise<{
    encryptedMin: any;
    encryptedMax: any;
    proof: any;
  }> {
    if (!this.instance) {
      throw new Error('FHE not initialized');
    }

    if (minSalary > maxSalary) {
      throw new Error('Min must be <= max');
    }

    try {
      const input = this.instance.createEncryptedInput(
        contractAddress,
        userAddress
      );

      input.add64(minSalary);
      input.add64(maxSalary);

      

      const encrypted = await input.encrypt();

      return {
        encryptedMin: encrypted.handles[0],
        encryptedMax: encrypted.handles[1],
        proof: encrypted.inputProof,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.initialized && this.instance !== null;
  }
}












// import { Injectable } from '@angular/core';
// import { initFhevm, createInstance } from 'fhevmjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class FheService {
//   private instance: any = null;
//   private initialized = false;

//   async initialize(provider: any): Promise<void> {
//     if (this.initialized) return;

//     try {
//       // Initialize FHEVM (loads WASM)
//        const fhevm = await this.loadFhevmJS();
      
//       await fhevm.initFhevm();
//       // await initFhevm();

//       // Get chain ID
//       const network = await provider.getNetwork();
//       const chainId = Number(network.chainId);

//       // Fetch public key from ACL contract
//       // const publicKey = await getPublicKey(
//       //   chainId,
//       //   provider
//       // );

//       // Create instance
//       // this.instance = await createInstance({
//       //   chainId,
//       //   publicKey,
//       //   gatewayUrl: 'https://gateway.sepolia.zama.ai',
//       // });

//       const instance = await createInstance({
//   // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
//   aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
//   // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
//   kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
//   // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
//   // DECRYPTION_ADDRESS (Gateway chain)
//   // INPUT_VERIFICATION_ADDRESS (Gateway chain)
//   // FHEVM Host chain id
//   chainId: 11155111,
//   // Gateway chain id
//   // Optional RPC provider to host chain
//   // network: "https://eth-sepolia.public.blastapi.io",
//   // Relayer URL
// });

//       this.initialized = true;
//       console.log('✅ FHE ready');
//     } catch (error) {
//       console.error('❌ FHE failed:', error);
//       throw error;
//     }
//   }

//   async encryptRange(
//     min: number,
//     max: number,
//     user: string,
//     contract: string
//   ) {
//     if (!this.instance) {
//       throw new Error('Not initialized');
//     }

//     const input = this.instance.createEncryptedInput(contract, user);
//     input.add64(min);
//     input.add64(max);
    
//     const encrypted = input.encrypt();

//     return {
//       encryptedMin: encrypted.handles[0],
//       encryptedMax: encrypted.handles[1],
//       proof: encrypted.inputProof,
//     };
//   }

//   isReady(): boolean {
//     return this.initialized && this.instance !== null;
//   }
  

//    private loadFhevmJS(): Promise<any> {
//     return new Promise((resolve, reject) => {
//       if ((window as any).fhevm) {
//         resolve((window as any).fhevm);
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://cdn.jsdelivr.net/npm/fhevmjs@0.5.3/bundle/index.min.js';
//       script.onload = () => resolve((window as any).fhevm);
//       script.onerror = () => reject(new Error('Failed to load fhevmjs'));
//       document.head.appendChild(script);
//     });
//   }
// }
