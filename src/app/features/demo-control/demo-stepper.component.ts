import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DemoOrchestratorService, DEMO_STEPS } from '../../core/services/demo-orchestrator.service';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { SystemEventsService } from '../../core/services/system-events.service';
import { TokenService } from '../../core/services/token.service';
import { TokenDialogComponent } from '../../shared/components/token-dialog.component';

@Component({
  selector: 'app-demo-stepper',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, StatusIndicatorComponent],
  template: `
    <div class="stepper-bar">
      <div class="brand">
        <mat-icon class="logo">medical_services</mat-icon>
        <span class="title">HDIM Validation</span>
        <app-status-indicator
          [status]="(connectionStatus$ | async) || 'disconnected'"
          [label]="(connectionStatus$ | async) === 'connected' ? 'Live' : 'Offline'" />
      </div>

      <div class="steps">
        @for (step of visibleSteps; track step.phase; let i = $index) {
          <button class="step-btn"
            [class.active]="i === currentIndex"
            [class.completed]="i < currentIndex"
            [class.future]="i > currentIndex"
            [matTooltip]="step.label"
            (click)="goToStep(i)">
            <mat-icon>{{ i < currentIndex ? 'check_circle' : step.icon }}</mat-icon>
            <span class="step-label">{{ step.label }}</span>
          </button>
          @if (i < visibleSteps.length - 1) {
            <div class="step-connector" [class.completed]="i < currentIndex"></div>
          }
        }
      </div>

      <div class="controls">
        <button mat-icon-button (click)="goBack()" [disabled]="!orchestrator.canGoBack()" matTooltip="Previous">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-icon-button (click)="advance()" [disabled]="!orchestrator.canAdvance()" matTooltip="Next">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <div class="control-divider"></div>
        <button mat-icon-button matTooltip="Traffic Inspector" (click)="openTrafficInspector()"
          [class.inspector-active]="isInspectorActive">
          <mat-icon>monitoring</mat-icon>
        </button>
        <button mat-icon-button matTooltip="API Token" (click)="openTokenDialog()"
          [class.token-set]="tokenService.hasToken()">
          <mat-icon>{{ tokenService.hasToken() ? 'lock_open' : 'lock' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .stepper-bar {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      gap: 16px;
      height: 56px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      .logo { color: var(--accent-cyan); }
      .title { font-weight: 600; font-size: 16px; white-space: nowrap; }
    }
    .steps {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      overflow-x: auto;
      padding: 0 8px;
      &::-webkit-scrollbar { height: 0; }
    }
    .step-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 20px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      font-size: 12px;
      transition: all 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &.active {
        background: rgba(0, 188, 212, 0.15);
        color: var(--accent-cyan);
        mat-icon { color: var(--accent-cyan); }
      }
      &.completed {
        color: var(--accent-green);
        mat-icon { color: var(--accent-green); }
      }
      &:hover:not(.active) { background: var(--bg-elevated); }
    }
    .step-label { @media (max-width: 1200px) { display: none; } }
    .step-connector {
      width: 20px;
      height: 2px;
      background: var(--border-color);
      flex-shrink: 0;
      &.completed { background: var(--accent-green); }
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .control-divider {
      width: 1px;
      height: 24px;
      background: var(--border-color);
      margin: 0 4px;
    }
    .inspector-active {
      color: var(--accent-cyan) !important;
      background: rgba(0, 188, 212, 0.15);
      border-radius: 50%;
    }
    .token-set {
      color: var(--accent-green) !important;
    }
  `],
})
export class DemoStepperComponent {
  orchestrator = inject(DemoOrchestratorService);
  tokenService = inject(TokenService);
  private router = inject(Router);
  private systemEvents = inject(SystemEventsService);
  private dialog = inject(MatDialog);

  connectionStatus$ = this.systemEvents.connectionStatus$;

  get isInspectorActive(): boolean {
    return this.router.url === '/traffic';
  }

  openTrafficInspector(): void {
    if (this.isInspectorActive) {
      this.router.navigate(['/seeding']);
    } else {
      this.router.navigate(['/traffic']);
    }
  }

  openTokenDialog(): void {
    this.dialog.open(TokenDialogComponent, { width: '440px' });
  }

  get visibleSteps() {
    return DEMO_STEPS.filter(s => s.phase !== 'IDLE' && s.phase !== 'COMPLETE');
  }

  get currentIndex(): number {
    const phase = this.orchestrator.currentPhase;
    return this.visibleSteps.findIndex(s => s.phase === phase);
  }

  goToStep(index: number): void {
    const step = this.visibleSteps[index];
    if (step) {
      this.orchestrator.goToPhase(step.phase);
      this.router.navigate([step.route]);
    }
  }

  advance(): void {
    this.orchestrator.advance();
    const step = DEMO_STEPS[this.orchestrator.currentStepIndex];
    if (step) this.router.navigate([step.route]);
  }

  goBack(): void {
    this.orchestrator.goBack();
    const step = DEMO_STEPS[this.orchestrator.currentStepIndex];
    if (step) this.router.navigate([step.route]);
  }
}
