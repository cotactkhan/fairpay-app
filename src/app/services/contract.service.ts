import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { WalletService } from './wallet.service';
import { Negotiation } from '../../models/negotiation'; 
import { environment } from '../../environments/environment';
import abi from '../../assets/FairPay.json'

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

  constructor(private walletService: WalletService) {}

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
    const contract = this.getSignedContract();

    const tx = await contract['submitEmployerRange'](
      negotiationId,
      encryptedMin,
      encryptedMax,
      proof
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async submitCandidateRange(
    negotiationId: number,
    encryptedMin: string,
    encryptedMax: string,
    proof: string
  ): Promise<string> {
    const contract = this.getSignedContract();

    const tx = await contract['submitCandidateRange'](
      negotiationId,
      encryptedMin,
      encryptedMax,
      proof
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getNegotiation(id: number): Promise<Negotiation> {
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

  async getUserNegotiations(address: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    const ids = await this.contract['getUserNegotiations'](address);
    return ids.map((id: bigint) => Number(id));
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
}