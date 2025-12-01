import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { WalletService } from './wallet.service';
import { Negotiation } from '../../models/negotiation'; 
import { environment } from '../../environments/environment';
import abi from '../../assets/FairPay.json'
import { FheService1 } from './fhe.servicecopy';

const ABI = [
  'function createNegotiation(address _candidate, string _title, uint256 _deadlineDuration) returns (uint256)',
  'function submitEmployerRange(uint256 negotiationId, tuple(uint256 chainId, bytes32 handle) encryptedMin, tuple(uint256 chainId, bytes32 handle) encryptedMax, bytes inputProof)',
  'function submitCandidateRange(uint256 negotiationId, bytes encryptedMin, bytes encryptedMax, bytes inputProof)',
  'function getNegotiationSummary(uint256 negotiationId) view returns (tuple(uint256 negotiationId, address employer, address candidate, string title, uint8 state, uint256 createdAt, uint256 deadline, bool hasMatchResult, bool matchRevealed, uint64 meetingPoint))',
  'function getUserNegotiations(address user) view returns (uint256[])',
  'function getMatchResult(uint256 negotiationId) view returns (bool hasMatch, uint64 meetingPoint)',
  'function isExpired(uint256 negotiationId) view returns (bool)',
  'function getTotalNegotiations() view returns (uint256)',
  'event NegotiationCreated(uint256 indexed negotiationId, address indexed employer, address indexed candidate, string title, uint256 deadline)',
  'event MatchRevealed(uint256 indexed negotiationId, bool hasMatch, uint64 meetingPoint)'
];

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contract: ethers.Contract | null = null;

  constructor(private walletService: WalletService, private fheService: FheService1) {}

  initialize(contractAddress: string, rpcUrl: string): void {
    // const provider = new ethers.JsonRpcProvider(rpcUrl);
    if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    // this.contract = new ethers.Contract(environment.contractAddress, ABI, provider);
    this.contract = new ethers.Contract(environment.contractAddress, abi.abi, provider);
  } else {
    throw new Error('Install MetaMask');
  }

    //   const provider = new ethers.JsonRpcProvider(environment.localProvider ? environment.localRpcUrl : rpcUrl);

    // this.contract = new ethers.Contract(contractAddress, ABI, provider);
    // console.log('Contract initialized at', contractAddress);
    // console.log("provider:", provider);
  }

  private getSignedContract(): ethers.Contract {
    if (!this.contract) throw new Error('Contract not initialized');
    const signer = this.walletService.getSigner();
    return this.contract.connect(signer) as ethers.Contract;
  }

  async createNegotiation(
    candidate: string,
    title: string,
    deadlineHours: number
  ): Promise<{ id: number; txHash: string }> {
    const contract = this.getSignedContract();
    const deadlineSeconds = deadlineHours * 3600;

    // const tx = await contract.createNegotiation(
    //   candidate,
    //   title,
    //   deadlineSeconds
    // );
      const tx = await contract['createNegotiation'](
        candidate,
        title,
        deadlineSeconds
      );

    const receipt = await tx.wait();

    // Parse event
    let negotiationId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        if (parsed?.name === 'NegotiationCreated') {
          negotiationId = Number(parsed.args[0]);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    return { id: negotiationId, txHash: receipt.hash };
  }

  async submitEmployerRange(
    negotiationId: number,
    encryptedMin: any,
    encryptedMax: any,
    proof: any
  ): Promise<string> {
    console.log(1, "contract");
    const contract = this.getSignedContract();

    console.log(2, "contract");
    const tx = await contract['submitEmployerRange'](
      negotiationId,
      encryptedMin,
      encryptedMax,
      proof
    );
    
    console.log(3, "contract");
    

    const receipt = await tx.wait();
    console.log(4, "contract");

    return receipt.hash;
  }

  async submitCandidateRange(
  negotiationId: number,
  encryptedMin: any,
  encryptedMax: any,
  proof: any
): Promise<string> {
  const contract = this.getSignedContract();

  // In contract.service.ts → submitCandidateRange
const minHex = ethers.hexlify(encryptedMin);
const maxHex = ethers.hexlify(encryptedMax);

const tx = await contract["submitCandidateRange"](
  negotiationId,
  encryptedMin,
  encryptedMax,
  proof
);
  

  const receipt = await tx.wait();
  return receipt.hash;
}

  async getNegotiationOld(id: number): Promise<Negotiation> {
    if (!this.contract) throw new Error('Contract not initialized');

    const result = await this.contract['getNegotiationSummary'](id);

    return {
      negotiationId: Number(result.negotiationId),
      employer: result.employer,
      candidate: result.candidate,
      title: result.title,
      state: Number(result.state),
      createdAt: Number(result.createdAt),
      deadline: Number(result.deadline),
      hasMatchResult: result.hasMatchResult,
      matchRevealed: result.matchRevealed,
      meetingPoint: Number(result.meetingPoint)
    };
  }

  async getNegotiation(id: number): Promise<Negotiation> {
  if (!this.contract) throw new Error('Contract not initialized');
  
  const raw = await this.contract["negotiations"](id); // ← direct struct access

  return {
    negotiationId: Number(raw.negotiationId),
    employer: raw.employer,
    candidate: raw.candidate,
    title: raw.title,
    state: Number(raw.state), // 0=NOT_STARTED, 1=EMPLOYER_SUBMITTED, 2=CANDIDATE_SUBMITTED, 3=MATCH_READY, 4=COMPLETED
    createdAt: Number(raw.createdAt),
    deadline: Number(raw.deadline),
    hasMatchResult: false,        // not used anymore
    matchRevealed: raw.state === 4,
    meetingPoint: 0,              // will be filled after reveal
    hasMatchHandle: raw.hasMatch,         // bytes32
    meetingPointHandle: raw.meetingPoint  // bytes32
  };
}

  async getUserNegotiations(address: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    const ids = await this.contract['getUserNegotiations'](address);
    return ids.map((id: bigint) => Number(id));
  }

//   async revealMatch(
//   negotiationId: number,
//   requestId: number,
//   hasMatch: boolean,
//   meetingPoint: bigint,
//   cleartexts: string,
//   proof: string
// ): Promise<string> {
//   const contract = this.getSignedContract();
  
//   console.log('Revealing match with:', {
//     negotiationId,
//     requestId,
//     hasMatch,
//     meetingPoint: meetingPoint.toString(),
//     cleartextsLength: cleartexts.length,
//     proofLength: proof.length
//   });
  
//   const tx = await contract['revealMatch'](
//     negotiationId,
//     requestId,
//     hasMatch,
//     meetingPoint,
//     cleartexts,
//     proof,
//     {
//       gasLimit: 500000
//     }
//   );
  
//   const receipt = await tx.wait();
//   return receipt.hash;
// }

async revealMatch(
  negotiationId: number,
  requestId: number,
  hasMatch: boolean,
  meetingPoint: bigint,
  cleartexts: string,
  proof: string
): Promise<string> {
  const contract = this.getSignedContract();
  
  const tx = await contract['revealMatch'](
    negotiationId,
    requestId,
    hasMatch,
    meetingPoint,
    cleartexts,
    proof,
    { gasLimit: 500000 }
  );
  
  const receipt = await tx.wait();
  return receipt.hash;
}

  async revealMatchGrok(negotiationId: number): Promise<void> {
  if (!this.contract) throw new Error('Contract not initialized');

  await this.fheService.initialize1(); // ensure ready

  const contract = this.getSignedContract();
  const neg = await contract["negotiations"](negotiationId);

  // Make sure we're in the right state
  if (Number(neg.state) !== 3) {
    throw new Error('Match not ready yet');
  }

  const handles = [neg.hasMatch, neg.meetingPoint]; // both are bytes32 strings

  const requestId = Date.now();

  const { plaintexts, proof } = await this.fheService.decryptAndGetProof(handles, requestId);

  const [hasMatch, meetingPoint] = plaintexts;

  const tx = await contract["revealMatch"](
    negotiationId,
    requestId,
    hasMatch as boolean,
    meetingPoint as bigint,
    proof
  );

  await tx.wait();
}

// async getMatchHandles(negotiationId: number): Promise<{
//   hasMatchHandle: string;
//   meetingPointHandle: string;
// }> {
//   if (!this.contract) throw new Error('Contract not initialized');
  
//   // Access the struct directly from storage
//   const negotiation = await this.contract['negotiations'](negotiationId);
  
//   return {
//     hasMatchHandle: negotiation.hasMatch,
//     meetingPointHandle: negotiation.meetingPoint
//   };
// }

async getMatchHandles(negotiationId: number): Promise<{
  hasMatchHandle: string;
  meetingPointHandle: string;
}> {
  if (!this.contract) throw new Error('Contract not initialized');
  const result = await this.contract['getMatchHandles'](negotiationId);
  return {
    hasMatchHandle: result.hasMatchHandle || result[0],
    meetingPointHandle: result.meetingPointHandle || result[1]
  };
}

async getMatchHandlesWithStatus(negotiationId: number): Promise<{
  hasMatchHandle: string;
  meetingPointHandle: string;
  hasMatchMarked: boolean;
  meetingPointMarked: boolean;
}> {
  if (!this.contract) throw new Error('Contract not initialized');
  const result = await this.contract['getMatchHandlesWithStatus'](negotiationId);
  return {
    hasMatchHandle: result.hasMatchHandle || result[0],
    meetingPointHandle: result.meetingPointHandle || result[1],
    hasMatchMarked: result.hasMatchMarked || result[2],
    meetingPointMarked: result.meetingPointMarked || result[3]
  };
}

 

  async getMatchResult(id: number): Promise<{ hasMatch: boolean; meetingPoint: number }> {
    if (!this.contract) throw new Error('Contract not initialized');

    const result = await this.contract['getMatchResult'](id);
    console.log('Match result from contract:', result);
    return {
      hasMatch: result.hasMatch,
      meetingPoint: Number(result.meetingPoint)
    };
  }

  async isExpired(id: number): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract['isExpired'](id); 
  }

  onMatchRevealed(callback: (id: number, hasMatch: boolean, meetingPoint: number) => void): void {
    if (!this.contract) return;

    this.contract.on('MatchRevealed', (id, hasMatch, meetingPoint) => {
      callback(Number(id), hasMatch, Number(meetingPoint));
    });
  }

  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  async calculateMatch(negotiationId: number): Promise<string> {
  const contract = this.getSignedContract();
  // const tx = await contract["calculateMatch"](negotiationId);
  const tx = await contract["calculateMatch"](negotiationId, {
    gasLimit: 3000000
});
  const receipt = await tx.wait();
  return receipt.hash;
}




}