import { Injectable, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { from, Observable, of, throwError, timer } from 'rxjs';
import { catchError, concatMap, first, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const SDK_CDN_URL =
  'https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs';
// const SDK_CDN_URL =
// '/fairpay-app/src/assets/relayer-sdk-js.umd.js';

declare const window: any;

export interface EncryptedResult {
  encryptedData: `0x${string}`;
  inputProof: `0x${string}`;
}

@Injectable({ providedIn: 'root' })
export class FheService1 {
  private instance: any | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private ngZone: NgZone) {}

  /** Public entry point – call once (idempotent) */
  initialize1(): Promise<void> {
    console.log('FHEService1 initialize1 called');
    if (this.initialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.ngZone.runOutsideAngular(() => this.doInitialize());
    return this.initPromise;
  }

  /** ------------------------------------------------------------------ */
  /** 1. Load SDK → initSDK() → createInstance()                        */
  /** ------------------------------------------------------------------ */
  private async doInitialize(): Promise<void> {
    // 1. Load the script + poll for window.relayerSDK
    await this.loadRelayerSDK();
    console.log('relayerSDK loaded');

    // 2. initSDK (global TFHE context – no options needed)
    if (!window.relayerSDK.__initialized__) {
      await window.relayerSDK.initSDK();
      window.relayerSDK.__initialized__ = true;
    }
    console.log('relayerSDK initialized');

    // 3. Build config (Sepolia defaults + cached key + provider)
    // const config = await this.buildInstanceConfig(provider);

    // 4. Create the per-session instance
    console.log('before');
    console.log(window.ethereum);

    //         const config = { ...window.relayerSDK.SepoliaConfig };

    // // 2. Override ONLY the network with your wallet
    // config.network = window.ethereum;   // ← THIS IS THE MAGIC LINE

    // const config = {
    //   ...window.relayerSDK.SepoliaConfig,
    //   network: window.ethereum,
    //   // Ensure these are set from SepoliaConfig
    //   // aclContractAddress: window.relayerSDK.SepoliaConfig.aclContractAddress,
    //   // kmsVerifierAddress: window.relayerSDK.SepoliaConfig.kmsVerifierAddress,
    //   // gatewayUrl: window.relayerSDK.SepoliaConfig.gatewayUrl,
    // };

    const config = {
      ...window.relayerSDK.SepoliaConfig,
      network: window.ethereum,
      aclContractAddress:
        window.relayerSDK.SepoliaConfig.aclContractAddress ||
        '0x687820221192C5B662b25367F70076A37bc79b6c',
      kmsVerifierAddress: '0x9D6891A6240D6130c54ae243d8005063D05fE14b', // ← Add this
      gatewayUrl: 'https://gateway.testnet.zama.ai', // ← Add this
    };

    // Verify we're on Sepolia
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      throw new Error(
        `Wrong network. Please switch to Sepolia testnet (chain ID 11155111)`
      );
    }

    const code = await provider.getCode(environment.contractAddress);
    if (code === '0x') {
      throw new Error(
        'Contract not found at address: ' + environment.contractAddress
      );
    }

    // 3. Create the instance
    // this.instance = await window.relayerSDK.createInstance(config);
    console.log(
      window.relayerSDK.SepoliaConfig,
      '##############fhevm sepolia config'
    );
    // this.instance = await window.relayerSDK.createInstance({
    //   // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
    //   aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
    //   // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
    //   kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
    //   // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
    //   inputVerifierContractAddress:
    //     '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
    //   // DECRYPTION_ADDRESS (Gateway chain)
    //   verifyingContractAddressDecryption:
    //     '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
    //   // INPUT_VERIFICATION_ADDRESS (Gateway chain)
    //   verifyingContractAddressInputVerification:
    //     '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
    //   // FHEVM Host chain id
    //   chainId: 11155111,
    //   // Gateway chain id
    //   gatewayChainId: 55815,
    //   // Optional RPC provider to host chain
    //   // network: "https://eth-sepolia.public.blastapi.io",
    //   network: window.ethereum,
    //   // Relayer URL
    //   relayerUrl: 'https://relayer.testnet.zama.cloud',

    // });
    console.log("my sepolia config")
    console.log({...window.relayerSDK.SepoliaConfig})
    console.log("mid")
    console.log("end")
    this.instance = await window.relayerSDK.createInstance({
      ...window.relayerSDK.SepoliaConfig,
      network: window.ethereum, // override/add the network field
      gatewayUrl: "https://gateway.testnet.zama.ai", // NEW in v0.9
    });

    // this.instance = await window.relayerSDK.createInstance(
    //   ...window.relayerSDK.SepoliaConfig,

    // );

    console.log(this.instance, 'fhevm 1 instance');

    // 5. Cache the new public key for next page load
    // await this.cachePublicKey(config.aclContractAddress, this.instance);

    this.initialized = true;
    console.log('FHEVM instance ready');
  }

  /** ------------------------------------------------------------------ */
  /** 2. Load SDK from CDN + exponential back-off polling                */
  /** ------------------------------------------------------------------ */
  private loadRelayerSDK(): Promise<void> {
    // If already on window → resolve immediately
    if ((window as any).relayerSDK?.initSDK) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_CDN_URL;
      script.async = true;

      const maxAttempts = 12; // ~ 40 s total
      let attempt = 0;
      const poll = () => {
        if ((window as any).relayerSDK?.initSDK) {
          console.log(`relayerSDK ready after ${attempt} attempts`);
          resolve();
          return;
        }
        attempt++;
        if (attempt >= maxAttempts) {
          reject(new Error('relayer-sdk-js failed to load after max attempts'));
          return;
        }
        const delay = 100 * Math.pow(2, attempt - 1); // 100,200,400,...
        setTimeout(poll, delay);
      };

      script.onload = () => {
        console.log('relayer-sdk-js script loaded, start polling...');
        poll();
      };
      script.onerror = () => reject(new Error('Failed to load relayer-sdk-js'));

      document.head.appendChild(script);
    });
  }

  // fhe.servicecopy.ts
  // private async loadRelayerSDK(): Promise<void> {
  //   if ((window as any).relayerSDK?.initSDK) return;

  //   const res = await fetch('assets/relayer-sdk-js.umd.js');   // ← ONLY THIS LINE
  //   if (!res.ok) throw new Error('SDK file not found');

  //   const blobUrl = URL.createObjectURL(
  //     new Blob([await res.text()], { type: 'application/javascript' })
  //   );

  //   await new Promise<void>((ok, no) => {
  //     const s = document.createElement('script');
  //     s.src = blobUrl;
  //     s.onload = () => {
  //       const poll = setInterval(() => {
  //         if ((window as any).relayerSDK?.initSDK) {
  //           clearInterval(poll);
  //           URL.revokeObjectURL(blobUrl);
  //           console.log('relayerSDK ready!');
  //           ok();
  //         }
  //       }, 50);
  //       setTimeout(() => (clearInterval(poll), no('timeout')), 8000);
  //     };
  //     s.onerror = () => no('script error');
  //     document.head.appendChild(s);
  //   });
  // }

  //   private async loadRelayerSDK(): Promise<void> {
  //   if ((window as any).relayerSDK?.initSDK) return;

  //   const res = await fetch('relayer-sdk-js.umd.cjs');
  //   if (!res.ok) throw new Error('Failed to fetch SDK');
  //   const text = await res.text();

  //   const blobUrl = URL.createObjectURL(
  //     new Blob([text], { type: 'application/javascript' })
  //   );

  //   await new Promise<void>((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.src = blobUrl;

  //     const timer = setTimeout(() => reject(new Error('SDK load timeout')), 10000);
  //     const check = setInterval(() => {
  //       if ((window as any).relayerSDK?.initSDK) {
  //         clearInterval(check);
  //         clearTimeout(timer);
  //         URL.revokeObjectURL(blobUrl);
  //         resolve();
  //       }
  //     }, 50);

  //     script.onload = () => console.log('SDK script loaded');
  //     script.onerror = () => {
  //       clearInterval(check);
  //       clearTimeout(timer);
  //       URL.revokeObjectURL(blobUrl);
  //       reject(new Error('Script load failed'));
  //     };

  //     document.head.appendChild(script);
  //   });
  // }

  /** ------------------------------------------------------------------ */
  /** 3. Build createInstance config (Sepolia + cached key)             */
  /** ------------------------------------------------------------------ */
  // private async buildInstanceConfig(
  //   provider: ethers.Eip1193Provider
  // ): Promise<FhevmInstanceConfig> {
  //   const relayer = (window as any).relayerSDK as {
  //     SepoliaConfig: FhevmInstanceConfig;
  //   };

  //   const aclAddress = relayer.SepoliaConfig.aclContractAddress;
  //   if (!ethers.isAddress(aclAddress)) {
  //     throw new Error(`Invalid ACL address: ${aclAddress}`);
  //   }

  //   // Try to read cached key from localStorage
  //   const cached = await this.getCachedPublicKey(aclAddress);

  //   return {
  //     ...relayer.SepoliaConfig,
  //     network: provider,
  //     publicKey: cached?.publicKey ?? undefined,
  //     publicParams: cached?.publicParams ?? undefined,
  //   };
  // }

  /** ------------------------------------------------------------------ */
  /** 4. Cache public key (localStorage)                                 */
  /** ------------------------------------------------------------------ */
  // private async cachePublicKey(
  //   aclAddress: string,
  //   instance: FhevmInstance
  // ): Promise<void> {
  //   const key = instance.getPublicKey();
  //   const params = instance.getPublicParams(2048); // 2048 = default
  //   localStorage.setItem(
  //     `fhevm-pub-${aclAddress}`,
  //     JSON.stringify({
  //       publicKey: Array.from(key), // Uint8Array → number[]
  //       publicParams: Array.from(params),
  //     })
  //   );
  // }

  // private async getCachedPublicKey(
  //   aclAddress: string
  // ): Promise<{ publicKey: Uint8Array; publicParams: Uint8Array } | null> {
  //   const raw = localStorage.getItem(`fhevm-pub-${aclAddress}`);
  //   if (!raw) return null;
  //   try {
  //     const obj = JSON.parse(raw);
  //     return {
  //       publicKey: new Uint8Array(obj.publicKey),
  //       publicParams: new Uint8Array(obj.publicParams),
  //     };
  //   } catch {
  //     return null;
  //   }
  // }

  /** ------------------------------------------------------------------ */
  /** 5. Public encryption API (32-bit) – same as React version          */
  /** ------------------------------------------------------------------ */
  // async encryptNumber(
  //   value: number,
  //   contractAddress: string,
  //   userAddress: string
  // ): Promise<EncryptedResult> {
  //   if (!this.instance) throw new Error('FHEVM not initialized');

  //   const input = this.instance.createEncryptedInput(
  //     contractAddress,
  //     userAddress
  //   );
  //   input.add32(value);
  //   const encrypted = await input.encrypt();

  //   const toHex = (arr: Uint8Array): `0x${string}` =>
  //     `0x${Array.from(arr)
  //       .map((b) => b.toString(16).padStart(2, '0'))
  //       .join('')}`;

  //   return {
  //     encryptedData: toHex(encrypted.handles[0]),
  //     inputProof: toHex(encrypted.inputProof),
  //   };
  // }

  /** ------------------------------------------------------------------ */
  /** 6. Convenience helpers                                            */
  /** ------------------------------------------------------------------ */
  isReady(): boolean {
    return this.initialized && this.instance !== null;
  }

  getInstance(): any {
    if (!this.instance) throw new Error('FHEVM not ready');
    return this.instance;
  }

  // async encryptRange(
  //   minSalary: number,
  //   maxSalary: number,
  //   userAddress: string,
  //   contractAddress: string
  // ): Promise<{
  //   encryptedMin: any;
  //   encryptedMax: any;
  //   proof: any;
  // }> {
  //   if (!this.instance) {
  //     throw new Error('FHE not initialized1');
  //   }

  //   if (minSalary > maxSalary) {
  //     throw new Error('Min must be <= max');
  //   }

  //   try {
  //     const input = this.instance.createEncryptedInput(
  //       contractAddress,
  //       userAddress
  //     );
  //     input.add64(minSalary);
  //     input.add64(maxSalary);
  //     console.log('input before encrypt:', input);

  //     const encrypted = await input.encrypt();

  //     console.log(encrypted.proof, 'input proof');

  //     const toHex = (data: Uint8Array | string): string => {
  //       if (typeof data === 'string') return data;
  //       return (
  //         '0x' +
  //         Array.from(data)
  //           .map((byte) => byte.toString(16).padStart(2, '0'))
  //           .join('')
  //       );
  //     };

  //     return {
  //       encryptedMin: encrypted.handles[0],
  //       encryptedMax: encrypted.handles[1],
  //       proof: encrypted.inputProof,
  //     };
  //     //  return {
  //     //   encryptedMin: toHex(encrypted.handles[0]),
  //     //   encryptedMax: toHex(encrypted.handles[1]),
  //     //   proof: toHex(encrypted.inputProof),
  //     // };
  //   } catch (error) {
  //     console.error('Encryption failed:', error);
  //     throw error;
  //   }
  // }

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
      throw new Error('FHE not initialized1');
    }

    if (minSalary > maxSalary) {
      throw new Error('Min must be <= max');
    }

    try {
      console.log('=== Encryption Request ===');
      console.log('Contract:', contractAddress);
      console.log('User:', userAddress);
      console.log('Values:', { min: minSalary, max: maxSalary });

      // Ensure addresses are properly formatted
      const checksummedContract = ethers.getAddress(contractAddress);
      const checksummedUser = ethers.getAddress(userAddress);

      console.log('Using addresses:');
      console.log('  Contract:', checksummedContract);
      console.log('  User:', checksummedUser);

      // Verify contract code one more time right before encryption
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(checksummedContract);
      console.log('Contract bytecode length:', code.length);

      if (code === '0x') {
        throw new Error('Contract not found at: ' + checksummedContract);
      }

      // Create input with checksummed addresses
      console.log('Creating encrypted input...');
      const input = this.instance.createEncryptedInput(
        checksummedContract,
        checksummedUser
      );

      console.log('Adding values...');
      input.add64(minSalary);
      input.add64(maxSalary);

      // Log the internal state if available
      console.log('Input internal state:', {
        contractAddress: (input as any)._input?.contractAddress,
        userAddress: (input as any)._input?.userAddress,
        values: (input as any)._input?.values,
      });

      console.log('Calling encrypt (this contacts the relayer)...');
      const encrypted = await input.encrypt();

      console.log('✓ Encryption successful!');
      console.log('Result structure:', {
        handles: encrypted.handles?.length,
        handleTypes: encrypted.handles?.map((h: any) => typeof h),
        proofType: typeof encrypted.inputProof,
        proofLength: encrypted.inputProof?.length,
      });

      return {
        encryptedMin: encrypted.handles[0],
        encryptedMax: encrypted.handles[1],
        proof: encrypted.inputProof,
      };
    } catch (error: any) {
      console.error('=== Encryption Failed ===');
      console.error('Error:', error);

      // Try to extract detailed error info
      if (error?.message) {
        console.error('Message:', error.message);

        // Parse the JSON error from relayer
        const jsonMatch = error.message.match(/Content: (\{.*\})/);
        if (jsonMatch) {
          try {
            const errorContent = JSON.parse(jsonMatch[1]);
            console.error('Relayer error details:', errorContent);

            // Make the error message more user-friendly
            if (
              errorContent.message?.includes(
                'backend connection task has stopped'
              )
            ) {
              throw new Error(
                'Zama relayer is temporarily unavailable. ' +
                  'This is usually temporary - please try again in a few minutes. ' +
                  'If the issue persists, the contract may need to be redeployed or ' +
                  'the relayer may be experiencing downtime.'
              );
            }
          } catch (parseError) {
            console.error('Could not parse error JSON');
          }
        }
      }

      throw error;
    }
  }

 

  async diagnoseContract(contractAddress: string): Promise<void> {
    console.log('=== Contract Diagnosis ===');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const checksummed = ethers.getAddress(contractAddress);

    // 1. Check contract exists
    const code = await provider.getCode(checksummed);
    console.log('✓ Contract exists:', code !== '0x');
    console.log('  Bytecode size:', code.length, 'bytes');

    // 2. Check network
    const network = await provider.getNetwork();
    console.log('✓ Network:', network.chainId, network.name);
    console.log('  Expected: 11155111 (Sepolia)');
    console.log('  Match:', network.chainId === 11155111n);

    // 3. Check SDK config
    console.log('✓ SDK Config:');
    console.log('  ACL:', window.relayerSDK.SepoliaConfig.aclContractAddress);
    console.log('  KMS:', window.relayerSDK.SepoliaConfig.kmsVerifierAddress);
    console.log('  Gateway:', window.relayerSDK.SepoliaConfig.gatewayUrl);

    // 4. Check instance
    console.log('✓ FHE Instance:');
    console.log('  Created:', this.instance !== null);
    console.log(
      '  Has public key:',
      this.instance?.hasPublicKey?.() ?? 'unknown'
    );

    // 5. Try a simple test
    try {
      const testInput = this.instance.createEncryptedInput(
        checksummed,
        checksummed
      );
      console.log('✓ Can create input: true');
    } catch (e) {
      console.error('✗ Cannot create input:', e);
    }
  }

  async decryptAndGetProof(
    handles: string[],
    requestId?: number
  ): Promise<{
    plaintexts: (boolean | bigint)[];
    proof: `0x${string}`;
  }> {
    if (!this.instance) throw new Error('FHEVM instance not initialized');

    // Use a proper unique requestId (Date.now() is fine)
    const rid = requestId ?? Date.now();

    // The relayer SDK supports batch decryption via .decrypt()
    // It automatically registers the requestId internally
    const plaintexts: (boolean | bigint)[] = [];

    for (const handle of handles) {
      // handle is bytes32 string like "0xabc123..."
      const pt = await this.instance.decrypt(handle);
      plaintexts.push(pt);
    }

    // Get the re-encryption proof for this requestId
    // This is the same proof expected by FHE.checkSignatures()
    const proof = this.instance.getReencryptionProof(rid);

    return { plaintexts, proof: proof as `0x${string}` };
  }

  // async encryptRange(
  //   minSalary: number,
  //   maxSalary: number,
  //   userAddress: string,
  //   contractAddress: string
  // ): Promise<{
  //   encryptedMin: `0x${string}`;
  //   encryptedMax: `0x${string}`;
  //   proof: `0x${string}`;
  // }> {
  //   if (!this.instance) {
  //     throw new Error('FHE not initialized');
  //   }

  //   if (minSalary > maxSalary) {
  //     throw new Error('Min must be <= max');
  //   }

  //   try {
  //     const input = this.instance.createEncryptedInput(
  //       contractAddress,
  //       userAddress
  //     );

  //     // Add both 64-bit values
  //     input.add64(minSalary);
  //     input.add64(maxSalary);

  //     // Encrypt
  //     const encrypted = await input.encrypt();

  //     // Convert Uint8Array → hex string
  //     const toHex = (arr: Uint8Array): `0x${string}` =>
  //       `0x${Array.from(arr)
  //         .map((b) => b.toString(16).padStart(2, '0'))
  //         .join('')}`;

  //     return {
  //       encryptedMin: toHex(encrypted.handles[0]),
  //       encryptedMax: toHex(encrypted.handles[1]),
  //       proof: toHex(encrypted.inputProof),
  //     };
  //   } catch (error) {
  //     console.error('Encryption failed:', error);
  //     throw error;
  //   }
  // }


  async decryptMatchResults(
  hasMatchHandle: string,
  meetingPointHandle: string,
  requestId: number
): Promise<{
  hasMatch: boolean;
  meetingPoint: bigint;
  proof: string;
}> {
  if (!this.instance) throw new Error('FHEVM instance not initialized');
  
  console.log('Attempting to decrypt handles:', {
    hasMatchHandle,
    meetingPointHandle,
    requestId
  });
  
  try {
    // Decrypt both values
    // const hasMatchDecrypted = await this.instance.decrypt(hasMatchHandle);
    const hasMatchDecrypted = await this.instance.publicDecrypt([hasMatchHandle]);
    // const meetingPointDecrypted = await this.instance.decrypt(meetingPointHandle);
    const meetingPointDecrypted = await this.instance.publicDecrypt([meetingPointHandle]);
    
    console.log('Decryption successful:', {
      hasMatch: hasMatchDecrypted,
      meetingPoint: meetingPointDecrypted.toString()
    });
    
    // Get the proof for this decryption
    const proof = this.instance.getReencryptionProof(requestId);
    
    return {
      hasMatch: Boolean(hasMatchDecrypted),
      meetingPoint: BigInt(meetingPointDecrypted),
      proof: proof as string
    };
  } catch (error: any) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}


async publicDecryptHandles(
  handles: string[],
  contractAddress: string
): Promise<{
  cleartexts: any[];
  proof: string;
  requestId: number;
}> {
  if (!this.instance) throw new Error('FHEVM instance not initialized');
  
  console.log('Starting public decryption:', { handles, contractAddress });
  
  try {
    const requestId = Date.now();
    
    // Call publicDecrypt on the instance
    // This contacts the Zama Relayer/Gateway
    const result = await this.instance.publicDecrypt(handles, contractAddress);
    
    console.log('Decryption result:', result);
    
    // Extract the data - format may vary
    const cleartexts = Array.isArray(result) ? result : (result.plaintexts || result.cleartexts || []);
    const proof = result.proof || result.signature || '0x';
    
    return {
      cleartexts,
      proof,
      requestId
    };
  } catch (error: any) {
    console.error('Public decryption error:', error);
    throw error;
  }
}


}
