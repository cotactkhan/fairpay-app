import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { ContractService } from '../../services/contract.service';
import { FheService } from '../../services/fhe.service';
import { Negotiation, NegotiationState, STATE_NAMES } from '../../../models/negotiation';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
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

  employerRange = { min: 0, max: 0 };
  candidateRange = { min: 0, max: 0 };

  private refreshSub?: Subscription;
  private timeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletService: WalletService,
    private contractService: ContractService,
    private fheService: FheService
  ) {}

  async ngOnInit(): Promise<void> {
    this.negotiationId = Number(this.route.snapshot.paramMap.get('id'));

    await this.loadNegotiation();

    // Refresh every 10 seconds
    // this.refreshSub = interval(10000).subscribe(() => {
    //   this.loadNegotiation();
    // });

    // // Update time every second
    // this.timeSub = interval(1000).subscribe(() => {
    //   this.updateTime();
    // });

    // // Listen for match events
    // this.contractService.onMatchRevealed((id) => {
    //   if (id === this.negotiationId) {
    //     this.loadNegotiation();
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.timeSub?.unsubscribe();
    this.contractService.removeAllListeners();
  }

  async loadNegotiation(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      console.log("Loading negotiation ID:", this.negotiationId);
      this.negotiation = await this.contractService.getNegotiation(this.negotiationId);

      const userAddress = this.walletService.getAddress();
      this.isEmployer = this.negotiation.employer.toLowerCase() === userAddress.toLowerCase();
      this.isCandidate = this.negotiation.candidate.toLowerCase() === userAddress.toLowerCase();
            console.log("1");


      this.isExpired = await this.contractService.isExpired(this.negotiationId);
            console.log("2");
      this.updateTime();
    } catch (err: any) {
      this.error = err.message || 'Failed to load negotiation';
    } finally {
      this.loading = false;
    }
  }

  async submitEmployerRange(): Promise<void> {
     try {
      // await this.fheService.initialize(this.walletService.provider);
      await this.fheService.initialize();
    } catch (error) {
      console.error('FHE init failed:', error);
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

      const encrypted = await this.fheService.encryptRange(
        this.employerRange.min,
        this.employerRange.max,
        userAddress,
        environment.contractAddress
      );

      await this.contractService.submitEmployerRange(
        this.negotiationId,
        encrypted.encryptedMin,
        encrypted.encryptedMax,
        encrypted.proof
      );

      await this.loadNegotiation();
    } catch (err: any) {
      this.submitError = err.message || 'Submit failed';
    } finally {
      this.submitting = false;
    }
  }

  async submitCandidateRange(): Promise<void> {
    if (!this.negotiation || this.isExpired) return;

    if (this.candidateRange.min > this.candidateRange.max) {
      this.submitError = 'Min must be <= max';
      return;
    }

    this.submitting = true;
    this.submitError = null;

    try {
      const userAddress = this.walletService.getAddress();

      const encrypted = await this.fheService.encryptRange(
        this.candidateRange.min,
        this.candidateRange.max,
        userAddress,
        environment.contractAddress
      );

      await this.contractService.submitCandidateRange(
        this.negotiationId,
        encrypted.encryptedMin,
        encrypted.encryptedMax,
        encrypted.proof
      );

      await this.loadNegotiation();
    } catch (err: any) {
      this.submitError = err.message || 'Submit failed';
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

  getStateName(state: NegotiationState): string {
    return STATE_NAMES[state] || 'Unknown';
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
}