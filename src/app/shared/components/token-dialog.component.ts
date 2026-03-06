import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-token-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>vpn_key</mat-icon>
      API Token
    </h2>
    <mat-dialog-content>
      <div class="status" [class.active]="tokenService.hasToken()">
        <mat-icon>{{ tokenService.hasToken() ? 'check_circle' : 'cancel' }}</mat-icon>
        {{ tokenService.hasToken() ? 'Token set' : 'No token' }}
      </div>
      <mat-form-field appearance="outline" class="token-field">
        <mat-label>Bearer Token (JWT)</mat-label>
        <textarea matInput [(ngModel)]="tokenValue" rows="4" placeholder="eyJ..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="clear()" [disabled]="!tokenService.hasToken()">Clear</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!tokenValue.trim()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; }
    .token-field { width: 100%; margin-top: 12px; }
    .status {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; border-radius: 8px;
      background: rgba(244, 67, 54, 0.1); color: #f44336;
      font-size: 13px;
    }
    .status.active { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    textarea { font-family: monospace; font-size: 12px; }
  `],
})
export class TokenDialogComponent {
  tokenService = inject(TokenService);
  private dialogRef = inject(MatDialogRef<TokenDialogComponent>);

  tokenValue = '';

  save(): void {
    const trimmed = this.tokenValue.trim();
    if (trimmed) {
      this.tokenService.setToken(trimmed);
      this.dialogRef.close();
    }
  }

  clear(): void {
    this.tokenService.clearToken();
    this.tokenValue = '';
  }
}
