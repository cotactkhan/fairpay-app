// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { interval, Subscription } from 'rxjs';
// import { WalletService } from '../../services/wallet.service';
// import { ContractService } from '../../services/contract.service';
// import { FheService } from '../../services/fhe.service';
// import {
//   Negotiation,
//   NegotiationState,
//   STATE_NAMES,
// } from '../../../models/negotiation';
// import { environment } from '../../../environments/environment';
// import { FheService1 } from '../../services/fhe.servicecopy';

// @Component({
//   selector: 'app-details',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './details.component.html',
//   styleUrl: './details.component.css',
// })
// export class DetailsComponent implements OnInit, OnDestroy {
//   negotiationId = 0;
//   negotiation: Negotiation | null = null;
//   loading = true;
//   error: string | null = null;
//   submitError: string | null = null;

//   isEmployer = false;
//   isCandidate = false;
//   isExpired = false;
//   timeRemaining = '';

//   submitting = false;

//   employerRange = { min: 10000, max: 100000 };
//   candidateRange = { min: 0, max: 0 };

//   private refreshSub?: Subscription;
//   private timeSub?: Subscription;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private walletService: WalletService,
//     private contractService: ContractService,
//     private fheService: FheService,
//     private fheService1: FheService1
//   ) {}

//   async ngOnInit(): Promise<void> {
//     this.negotiationId = Number(this.route.snapshot.paramMap.get('id'));

//     await this.loadNegotiation();

//     // Refresh every 10 seconds
//     // this.refreshSub = interval(10000).subscribe(() => {
//     //   this.loadNegotiation();
//     // });

//     // // Update time every second
//     // this.timeSub = interval(1000).subscribe(() => {
//     //   this.updateTime();
//     // });

//     // // Listen for match events
//     // this.contractService.onMatchRevealed((id) => {
//     //   if (id === this.negotiationId) {
//     //     this.loadNegotiation();
//     //   }
//     // });
//   }

//   ngOnDestroy(): void {
//     this.refreshSub?.unsubscribe();
//     this.timeSub?.unsubscribe();
//     this.contractService.removeAllListeners();
//   }

//   async loadNegotiation(): Promise<void> {
//     this.loading = true;
//     this.error = null;

//     try {
//       console.log('Loading negotiation ID:', this.negotiationId);
//       this.negotiation = await this.contractService.getNegotiation(
//         this.negotiationId
//       );

//       const userAddress = this.walletService.getAddress();
//       this.isEmployer =
//         this.negotiation.employer.toLowerCase() === userAddress.toLowerCase();
//       this.isCandidate =
//         this.negotiation.candidate.toLowerCase() === userAddress.toLowerCase();
//       console.log('1');

//       this.isExpired = await this.contractService.isExpired(this.negotiationId);
//       console.log('2');
//       this.updateTime();
//     } catch (err: any) {
//       this.error = err.message || 'Failed to load negotiation';
//     } finally {
//       this.loading = false;
//     }
//   }

//   async submitEmployerRange(): Promise<void> {
//     try {
//       // await this.fheService.initialize(this.walletService.provider);
//       // await this.fheService1.initialize1();
//       await this.fheService1.initialize1();

//       // Diagnose the setup
//       await this.fheService1.diagnoseContract(environment.contractAddress);
//       // await this.fheService.initialize();
//     } catch (error) {
//       console.error('FHE init failed:', error);
//     }
//     if (!this.negotiation || this.isExpired) return;

//     if (this.employerRange.min > this.employerRange.max) {
//       this.submitError = 'Min must be <= max';
//       return;
//     }

//     this.submitting = true;
//     this.submitError = null;

//     try {
//       const userAddress = this.walletService.getAddress();

//       // const encrypted = await this.fheService.encryptRange(
//       //   this.employerRange.min,
//       //   this.employerRange.max,
//       //   userAddress,
//       //   environment.contractAddress
//       // );

//       const encrypted = await this.fheService1.encryptRange(
//         this.employerRange.min,
//         this.employerRange.max,
//         userAddress,
//         environment.contractAddress
//       );
//       console.log('Encrypted data:', encrypted);
//       console.log(this.negotiationId, 'negotiation id');
//       console.log(encrypted.encryptedMin, 'encrypted min');
//       console.log(encrypted.encryptedMax, 'encrypted max');
//       console.log(encrypted.proof, 'proof');

//       await this.contractService.submitEmployerRange(
//         this.negotiationId,
//         encrypted.encryptedMin,
//         encrypted.encryptedMax,
//         encrypted.proof
//       );
//       console.log('Submitted employer range');
//       await this.loadNegotiation();
//     } catch (err: any) {
//       this.submitError = err.message || 'Submit failed';
//     } finally {
//       this.submitting = false;
//     }
//   }

//   async submitCandidateRange(): Promise<void> {

//       try {
//       // await this.fheService.initialize(this.walletService.provider);
//       // await this.fheService1.initialize1();
//       await this.fheService1.initialize1();

//       // Diagnose the setup
//       await this.fheService1.diagnoseContract(environment.contractAddress);
//       // await this.fheService.initialize();
//     } catch (error) {
//       console.error('FHE init failed:', error);
//     }
    
//     if (!this.negotiation || this.isExpired) return;

//     if (this.candidateRange.min > this.candidateRange.max) {
//       this.submitError = 'Min must be <= max';
//       return;
//     }

//     this.submitting = true;
//     this.submitError = null;

//     try {
//       const userAddress = this.walletService.getAddress();

//       // const encrypted = await this.fheService.encryptRange(
//       //   this.candidateRange.min,
//       //   this.candidateRange.max,
//       //   userAddress,
//       //   environment.contractAddress
//       // );

//        const encrypted = await this.fheService1.encryptRange(
//         this.candidateRange.min,
//         this.candidateRange.max,
//         userAddress,
//         environment.contractAddress
//       );

//         console.log('Encrypted data:', encrypted);
//       console.log(this.negotiationId, 'negotiation id');
//       console.log(encrypted.encryptedMin, 'encrypted min');
//       console.log(encrypted.encryptedMax, 'encrypted max');
//       console.log(encrypted.proof, 'proof');

//       await this.contractService.submitCandidateRange(
//         this.negotiationId,
//         encrypted.encryptedMin,
//         encrypted.encryptedMax,
//         encrypted.proof
//       );
//        console.log('Submitted candidate range');
//       await this.loadNegotiation();
//     } catch (err: any) {
//       this.submitError = err.message || 'Submit failed';
//     } finally {
//       this.submitting = false;
//     }
//   }

//   updateTime(): void {
//     if (!this.negotiation) return;

//     const now = Math.floor(Date.now() / 1000);
//     const remaining = this.negotiation.deadline - now;

//     if (remaining <= 0) {
//       this.timeRemaining = 'Expired';
//       return;
//     }

//     const days = Math.floor(remaining / 86400);
//     const hours = Math.floor((remaining % 86400) / 3600);
//     const minutes = Math.floor((remaining % 3600) / 60);

//     if (days > 0) this.timeRemaining = `${days}d ${hours}h`;
//     else if (hours > 0) this.timeRemaining = `${hours}h ${minutes}m`;
//     else this.timeRemaining = `${minutes}m`;
//   }

//   getStateName(state: NegotiationState): string {
//     return STATE_NAMES[state] || 'Unknown';
//   }

//   formatDate(timestamp: number): string {
//     return new Date(timestamp * 1000).toLocaleString();
//   }

//   async refresh(): Promise<void> {
//     await this.loadNegotiation();
//   }

//   goBack(): void {
//     this.router.navigate(['/list']);
//   }
// }





import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { ContractService } from '../../services/contract.service';
import {
  Negotiation,
  NegotiationState,
  STATE_NAMES,
} from '../../../models/negotiation';
import { environment } from '../../../environments/environment';
import { FheService1 } from '../../services/fhe.servicecopy';
import { ethers } from 'ethers';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit, OnDestroy {
  negotiationId = 0;
  negotiation: Negotiation | null = null;
  loading = true;
  error: string | null = null;
  submitError: string | null = null;

  isEmployer = false;
  isCandidate = false;
  isExpired = false;
  timeRemaining = '';

  submitting = false;
  waitingForMatch = false;

  employerRange = { min: 10000, max: 100000 };
  candidateRange = { min: 0, max: 0 };

  matchResult: { hasMatch: boolean; meetingPoint: number } | null = null;
  

  private refreshSub?: Subscription;
  private timeSub?: Subscription;
  private eventSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletService: WalletService,
    private contractService: ContractService,
    private fheService1: FheService1
  ) {}

  async ngOnInit(): Promise<void> {
    this.negotiationId =  await Number(this.route.snapshot.paramMap.get('id'));
    await this.loadNegotiation();
    
    console.log('Setup periodic refresh and event listeners');
    // await this.contractService.logs(this.negotiationId)
    // await this.contractService.runDebug(this.negotiationId);

    
    // await this.contractService.calculateMatch(this.negotiationId);
    await this.calculateAndRevealMatch();
    console.log("end")

    // Refresh every 10 seconds (optional)
    this.refreshSub = interval(10000).subscribe(() => {
      this.loadNegotiation();
    });

    // Update time every second
    this.timeSub = interval(1000).subscribe(() => {
      this.updateTime();
    });

    // Listen for match revealed events
    this.setupEventListener();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.timeSub?.unsubscribe();
    this.contractService.removeAllListeners();
  }

  setupEventListener(): void {
    this.contractService.onMatchRevealed((id, hasMatch, meetingPoint) => {
      console.log('MatchRevealed event:', { id, hasMatch, meetingPoint });
      if (id === this.negotiationId) {
        this.matchResult = { hasMatch, meetingPoint };
        this.waitingForMatch = false;
        this.loadNegotiation();
      }
    });
  }

  async loadNegotiation(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      console.log('Loading negotiation ID:', this.negotiationId);
      this.negotiation = await this.contractService.getNegotiation(
        this.negotiationId
      );

      const userAddress = this.walletService.getAddress();
      this.isEmployer =
        this.negotiation.employer.toLowerCase() === userAddress.toLowerCase();
      this.isCandidate =
        this.negotiation.candidate.toLowerCase() === userAddress.toLowerCase();

      this.isExpired = await this.contractService.isExpired(this.negotiationId);
      
      // Check if match is calculated but not yet revealed
      if (this.negotiation.state === 3) { // MATCH_CALCULATED
        this.waitingForMatch = true;
        console.log('Match calculated, waiting for callback to reveal results...');
      }
      
      // If completed, try to get match result
      if (this.negotiation.state === 4 && !this.matchResult) { // COMPLETED
        try {
          this.matchResult = await this.contractService.getMatchResult(this.negotiationId);
          this.waitingForMatch = false;
        } catch (err) {
          console.log('Match not yet revealed via callback');
        }
      }

      this.updateTime();
    } catch (err: any) {
      this.error = err.message || 'Failed to load negotiation';
    } finally {
      this.loading = false;
    }
  }

  async submitEmployerRange(): Promise<void> {
    try {
      await this.fheService1.initialize1();
      await this.fheService1.diagnoseContract(environment.contractAddress);
    } catch (error) {
      console.error('FHE init failed:', error);
      this.submitError = 'FHE initialization failed';
      return;
    }

    if (!this.negotiation || this.isExpired) return;

    if (this.employerRange.min > this.employerRange.max) {
      this.submitError = 'Min must be <= max';
      return;
    }

    this.submitting = true;
    this.submitError = null;

    try {
      const userAddress = this.walletService.getAddress();

      const encrypted = await this.fheService1.encryptRange(
        this.employerRange.min,
        this.employerRange.max,
        userAddress,
        environment.contractAddress
      );

      console.log('Encrypted data:', encrypted);

      await this.contractService.submitEmployerRange(
        this.negotiationId,
        encrypted.encryptedMin,
        encrypted.encryptedMax,
        encrypted.proof
      );

      console.log('Submitted employer range');
      await this.loadNegotiation();
    } catch (err: any) {
      this.submitError = err.message || 'Submit failed';
      console.error('Submit error:', err);
    } finally {
      this.submitting = false;
    }
  }

  async submitCandidateRange(): Promise<void> {
    try {
      await this.fheService1.initialize1();
      await this.fheService1.diagnoseContract(environment.contractAddress);
    } catch (error) {
      console.error('FHE init failed:', error);
      this.submitError = 'FHE initialization failed';
      return;
    }

    if (!this.negotiation || this.isExpired) return;

    if (this.candidateRange.min > this.candidateRange.max) {
      this.submitError = 'Min must be <= max';
      return;
    }

    this.submitting = true;
    this.submitError = null;

    try {
      const userAddress = this.walletService.getAddress();

      const encrypted = await this.fheService1.encryptRange(
        this.candidateRange.min,
        this.candidateRange.max,
        userAddress,
        environment.contractAddress
      );

      console.log('Encrypted data:', encrypted);

      await this.contractService.submitCandidateRange(
        this.negotiationId,
        encrypted.encryptedMin,
        encrypted.encryptedMax,
        encrypted.proof
      );

      console.log('Submitted candidate range');

      await this.contractService.calculateMatch(this.negotiationId);
console.log('Match calculated – waiting for MATCH_READY');
      
      // Show waiting message
      this.waitingForMatch = true;
      
      await this.loadNegotiation();
    } catch (err: any) {
      this.submitError = err.message || 'Submit failed';
      console.error('Submit error:', err);
    } finally {
      this.submitting = false;
    }
  }

  updateTime(): void {
    if (!this.negotiation) return;

    const now = Math.floor(Date.now() / 1000);
    const remaining = this.negotiation.deadline - now;

    if (remaining <= 0) {
      this.timeRemaining = 'Expired';
      return;
    }

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) this.timeRemaining = `${days}d ${hours}h`;
    else if (hours > 0) this.timeRemaining = `${hours}h ${minutes}m`;
    else this.timeRemaining = `${minutes}m`;
  }

  // getStateName(state: NegotiationState): string {
  //   return STATE_NAMES[state] || 'Unknown';
  // }

  getStateName(state: number): string {
  const names = [
    'Not Started',
    'Employer Submitted',
    'Candidate Submitted',
    'Match Ready',     // ← this is state 3
    'Completed'
  ];
  return names[state] ?? 'Unknown';
}

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  async refresh(): Promise<void> {
    await this.loadNegotiation();
  }

  goBack(): void {
    this.router.navigate(['/list']);
  }

  // Helper method to check if user can submit
  canEmployerSubmit(): boolean {
    return !!(
      this.negotiation &&
      this.isEmployer &&
      this.negotiation.state === 0 && // NOT_STARTED
      !this.isExpired &&
      !this.submitting
    );
  }

  canCandidateSubmit(): boolean {
    return !!(
      this.negotiation &&
      this.isCandidate &&
      this.negotiation.state === 1 && // EMPLOYER_SUBMITTED
      !this.isExpired &&
      !this.submitting
    );
  }

  isMatchReady(): boolean {
    return this.negotiation?.state === 4 && !!this.matchResult; // COMPLETED
  }




// Add this method
async revealResult(): Promise<void> {
  if (this.submitting || !this.negotiation || this.negotiation.state !== 3) return;

  this.submitting = true;
  this.submitError = null;

  try {
    // await this.contractService.revealMatch(this.negotiationId);
    // Success! Reload to show result
    await this.loadNegotiation();
  } catch (err: any) {
    this.submitError = err.message || 'Failed to reveal result. Try again.';
    console.error('Reveal failed:', err);
  } finally {
    this.submitting = false;
  }
}



private decryptionAttempts = 0;
private readonly maxDecryptionAttempts = 20;
private readonly decryptionInterval = 5000;
calculatingMatch = false;

// Main flow: Calculate and reveal
async calculateAndRevealMatch(): Promise<void> {
  if (!this.negotiation) return;
  
  this.calculatingMatch = true;
  this.waitingForMatch = true;
  this.submitError = null;
  this.decryptionAttempts = 0;
  console.log(1)
  
  try {
    // Step 1: Calculate match on-chain
    // console.log('Step 1: Calling calculateMatch...');
    // const txHash = await this.contractService.calculateMatch(this.negotiationId);
    // console.log('✓ Match calculated, tx:', txHash);
    
    // Wait a moment for transaction to be mined
    // await new Promise(resolve => setTimeout(resolve, 5000));

  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  // DIAGNOSTIC: Check if values were actually marked
  console.log("tanwerr")
  const status = await this.contractService.getMatchHandlesWithStatus(this.negotiationId);
  console.log('🔍 Handles status:', {
    hasMatchHandle: status.hasMatchHandle,
    hasMatchMarked: status.hasMatchMarked,
    meetingPointHandle: status.meetingPointHandle,
    meetingPointMarked: status.meetingPointMarked
  });
    console.log(1)

  
  if (!status.hasMatchMarked || !status.meetingPointMarked) {
    console.error('❌ Values were NOT marked for public decryption!');
    this.submitError = 'Values not marked for decryption. Check contract implementation.';
    return;
  }
  
  console.log('✅ Values confirmed marked for decryption');
    
    // Update state
    await this.loadNegotiation();
    
    // Step 2: Poll for decryption and reveal
    console.log('Step 2: Starting decryption polling...');
    await this.pollForDecryptionAndReveal();
    
  } catch (err: any) {
    console.error('Calculate/reveal error:', err);
    this.submitError = err.message || 'Operation failed';
    this.calculatingMatch = false;
    this.waitingForMatch = false;
  }
}

// Poll until values are decrypted, then reveal
private async pollForDecryptionAndReveal(): Promise<void> {
    this.decryptionAttempts++;
    
    console.log(`Decryption attempt ${this.decryptionAttempts}/${this.maxDecryptionAttempts}`);
    
    try {
      // Get encrypted handles from contract
      const handles = await this.contractService.getMatchHandles(this.negotiationId);
      
      console.log('Got handles:', handles);
      
      // Generate requestId (use timestamp)
      const requestId = Date.now();
      
      // Try to decrypt
      const decrypted = await this.fheService1.decryptMatchResults(
        handles.hasMatchHandle,
        handles.meetingPointHandle,
        requestId
      );
      
      console.log('✓ Decryption successful!');
      console.log('  Has match:', decrypted.hasMatch);
      console.log('  Meeting point:', decrypted.meetingPoint.toString());
      
      // Encode plaintexts as required by contract
      const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bool', 'uint64'],
        [decrypted.hasMatch, decrypted.meetingPoint]
      );
      
      console.log('Step 3: Calling revealMatch...');
      
      // Call revealMatch with decrypted values
      const revealTx = await this.contractService.revealMatch(
        this.negotiationId,
        requestId,
        decrypted.hasMatch,
        decrypted.meetingPoint,
        cleartexts,
        decrypted.proof
      );
      
      console.log('✓ Match revealed! tx:', revealTx);
      
      // Success!
      this.calculatingMatch = false;
      this.waitingForMatch = false;
      await this.loadNegotiation();
      
      // return true;
      
    } catch (err: any) {
      console.log('Decryption not ready:', err.message);
      // return false;
    }
  };

//   private async pollForDecryptionAndReveal(): Promise<void> {
//   const poll = async () => {
//     this.decryptionAttempts++;
    
//     if (this.decryptionAttempts > this.maxDecryptionAttempts) {
//       this.submitError = 'Decryption timeout after ' + this.maxDecryptionAttempts + ' attempts';
//       this.calculatingMatch = false;
//       this.waitingForMatch = false;
//       return;
//     }
    
//     console.log(`Decryption attempt ${this.decryptionAttempts}/${this.maxDecryptionAttempts}`);
    
//     try {
//       // Get handles
//       const handles = await this.contractService.getMatchHandles(this.negotiationId);
//       console.log('Handles:', handles);
      
//       // Try to decrypt
//       const decrypted = await this.fheService1.publicDecryptHandles(
//         [handles.hasMatchHandle, handles.meetingPointHandle],
//         environment.contractAddress
//       );
      
//       console.log('✓ Decryption successful:', decrypted);
      
//       // Parse results
//       const hasMatch = Boolean(decrypted.cleartexts[0]);
//       const meetingPoint = BigInt(decrypted.cleartexts[1]);
      
//       // Encode for contract
//       const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(
//         ['bool', 'uint64'],
//         [hasMatch, meetingPoint]
//       );
      
//       console.log('Calling revealMatch...');
      
//       // Reveal on-chain
//       await this.contractService.revealMatch(
//         this.negotiationId,
//         decrypted.requestId,
//         hasMatch,
//         meetingPoint,
//         cleartexts,
//         decrypted.proof
//       );
      
//       console.log('✓ Match revealed!');
      
//       // Success!
//       this.calculatingMatch = false;
//       this.waitingForMatch = false;
//       await this.loadNegotiation();
      
//     } catch (err: any) {
//       console.log('Not ready, retrying...', err.message);
//       // Retry after delay
//       setTimeout(poll, this.decryptionInterval);
//     }
//   };
  
//   // Start polling
//   setTimeout(poll, this.decryptionInterval);
// }

//  const poll = async () => {
//     if (this.decryptionAttempts >= this.maxDecryptionAttempts) {
//       this.submitError = 'Decryption timeout. The gateway may be slow. Try refreshing and retrying.';
//       this.calculatingMatch = false;
//       this.waitingForMatch = false;
//       return;
//     }
    
//     const success = await attemptDecryption();
    
//     if (!success) {
//       // Wait and retry
//       setTimeout(poll, this.decryptionInterval);
//     }
//   };
  
//   // Start polling
//   await poll();
// }

// // Helper to check if user can calculate
// canCalculateMatch(): boolean {
//   return !!(
//     this.negotiation &&
//     this.negotiation.state === 2 && // CANDIDATE_SUBMITTED
//     !this.calculatingMatch &&
//     !this.isExpired
//   );
// }

// // Manual retry if something goes wrong
// async retryReveal(): Promise<void> {
//   this.submitError = null;
//   await this.calculateAndRevealMatch();
// }



}