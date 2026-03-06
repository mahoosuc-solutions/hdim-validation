import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="metric-card">
      <div class="metric-header">
        <mat-icon [style.color]="color">{{ icon }}</mat-icon>
        <span class="metric-label">{{ label }}</span>
      </div>
      <div class="metric-value" [style.color]="color">{{ value }}</div>
      @if (subtitle) {
        <div class="metric-subtitle">{{ subtitle }}</div>
      }
      @if (change !== undefined) {
        <div class="metric-change" [class.positive]="change >= 0" [class.negative]="change < 0">
          <mat-icon>{{ change >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ change >= 0 ? '+' : '' }}{{ change }}{{ changeUnit }}
        </div>
      }
    </mat-card>
  `,
  styles: [`
    .metric-card {
      padding: 20px;
      min-width: 180px;
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .metric-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }
    .metric-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .metric-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-top: 8px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &.positive { color: var(--accent-green); }
      &.negative { color: var(--accent-red); }
    }
  `],
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = 'info';
  @Input() color = 'var(--accent-cyan)';
  @Input() subtitle?: string;
  @Input() change?: number;
  @Input() changeUnit = '';
}
