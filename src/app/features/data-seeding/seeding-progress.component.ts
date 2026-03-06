import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { DemoProgressResponse } from '../../core/services/demo-seeding.service';

@Component({
  selector: 'app-seeding-progress',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule],
  template: `
    <mat-card class="progress-card">
      <div class="progress-header">
        <mat-icon class="pulse">sync</mat-icon>
        <h3>Seeding in Progress</h3>
        <span class="percent">{{ progress.progressPercent | number:'1.0-0' }}%</span>
      </div>

      <mat-progress-bar mode="determinate" [value]="progress.progressPercent" />

      <div class="progress-details">
        <div class="detail">
          <span class="label">Stage</span>
          <span class="value">{{ progress.stage }}</span>
        </div>
        @if (progress.patientsGenerated != null) {
          <div class="detail">
            <span class="label">Patients Generated</span>
            <span class="value">{{ progress.patientsGenerated }}</span>
          </div>
        }
        @if (progress.patientsPersisted != null) {
          <div class="detail">
            <span class="label">Patients Persisted</span>
            <span class="value">{{ progress.patientsPersisted }}</span>
          </div>
        }
        @if (progress.careGapsCreated != null) {
          <div class="detail">
            <span class="label">Care Gaps Created</span>
            <span class="value">{{ progress.careGapsCreated }}</span>
          </div>
        }
        @if (progress.message) {
          <div class="detail full-width">
            <span class="label">Message</span>
            <span class="value message">{{ progress.message }}</span>
          </div>
        }
      </div>
    </mat-card>
  `,
  styles: [`
    .progress-card { padding: 24px; margin-top: 16px; }
    .progress-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      h3 { margin: 0; flex: 1; }
      .percent { font-size: 24px; font-weight: 700; color: var(--accent-cyan); }
    }
    mat-progress-bar { margin-bottom: 16px; }
    .progress-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .detail {
      display: flex;
      flex-direction: column;
      gap: 2px;
      &.full-width { grid-column: 1 / -1; }
      .label { font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px; }
      .value { font-size: 16px; font-weight: 600; }
      .message { font-size: 13px; font-weight: 400; color: var(--text-secondary); }
    }
  `],
})
export class SeedingProgressComponent {
  @Input({ required: true }) progress!: DemoProgressResponse;
}
