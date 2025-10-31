import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { WalletComponent } from './components/wallet/wallet.component';
import { WalletService } from './services/wallet.service';
import { ContractService } from './services/contract.service';
import { FheService } from './services/fhe.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, WalletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private walletService: WalletService,
    private contractService: ContractService,
    private fheService: FheService
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize contract
    this.contractService.initialize(
      environment.contractAddress,
      environment.rpcUrl
    );

    // Initialize FHE
    try {
      // await this.fheService.initialize(this.walletService.provider);
      await this.fheService.initialize();
    } catch (error) {
      console.error('FHE init failed:', error);
    }
  }
}
