import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-indicator" [class]="status">
      <span class="dot"></span>
      <span class="label">{{ label || status }}</span>
    </span>
  `,
  styles: [`
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .connected .dot, .UP .dot, .passed .dot { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }
    .disconnected .dot, .DOWN .dot, .failed .dot { background: var(--accent-red); box-shadow: 0 0 6px var(--accent-red); }
    .processing .dot, .UNKNOWN .dot, .pending .dot { background: var(--accent-orange); box-shadow: 0 0 6px var(--accent-orange); animation: pulse 1.5s infinite; }
    .idle .dot { background: var(--text-secondary); }
    .connected .label, .UP .label, .passed .label { color: var(--accent-green); }
    .disconnected .label, .DOWN .label, .failed .label { color: var(--accent-red); }
    .processing .label, .UNKNOWN .label, .pending .label { color: var(--accent-orange); }
    .idle .label { color: var(--text-secondary); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `],
})
export class StatusIndicatorComponent {
  @Input() status: string = 'idle';
  @Input() label?: string;
}
