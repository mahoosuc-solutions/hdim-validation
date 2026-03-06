import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, interval, takeUntil, switchMap, catchError, of } from 'rxjs';
import {
  DemoSeedingService,
  DemoScenarioResponse,
  DemoProgressResponse,
} from '../../core/services/demo-seeding.service';
import { DemoOrchestratorService } from '../../core/services/demo-orchestrator.service';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { SeedingProgressComponent } from './seeding-progress.component';

@Component({
  selector: 'app-seeding-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatSnackBarModule,
    MetricCardComponent, StatusIndicatorComponent, SeedingProgressComponent,
  ],
  template: `
    <div class="seeding-dashboard">
      <div class="header">
        <h2>
          <mat-icon>cloud_upload</mat-icon>
          Data Seeding
        </h2>
        <p class="subtitle">Seed 6 synthetic patient phenotypes into the live HDIM platform</p>
      </div>

      <div class="status-row">
        <app-metric-card label="Demo Status" [value]="demoReady ? 'Ready' : 'Checking...'"
          icon="dns" [color]="demoReady ? 'var(--accent-green)' : 'var(--accent-orange)'" />
        <app-metric-card label="Scenarios" [value]="scenarios.length"
          icon="library_books" color="var(--accent-cyan)" />
        <app-metric-card label="Phase" [value]="orchestrator.currentPhase"
          icon="play_circle" color="var(--accent-purple)" />
      </div>

      @if (scenarios.length > 0) {
        <mat-card class="scenario-picker">
          <h3>Available Scenarios</h3>
          <div class="scenario-grid">
            @for (scenario of scenarios; track scenario.name) {
              <mat-card class="scenario-card" [class.selected]="selectedScenario === scenario.name"
                (click)="selectScenario(scenario.name)">
                <mat-icon>{{ getScenarioIcon(scenario) }}</mat-icon>
                <div class="scenario-info">
                  <strong>{{ scenario.displayName || scenario.name }}</strong>
                  @if (scenario.description) {
                    <span class="desc">{{ scenario.description }}</span>
                  }
                  @if (scenario.patientCount) {
                    <span class="count">{{ scenario.patientCount }} patients</span>
                  }
                </div>
                @if (selectedScenario === scenario.name) {
                  <mat-icon class="check">check_circle</mat-icon>
                }
              </mat-card>
            }
          </div>

          <div class="actions">
            <button mat-raised-button color="primary"
              [disabled]="!selectedScenario || isSeeding"
              (click)="startSeeding()">
              <mat-icon>play_arrow</mat-icon>
              Seed Data
            </button>
            <button mat-stroked-button [disabled]="isSeeding" (click)="resetData()">
              <mat-icon>restart_alt</mat-icon>
              Reset
            </button>
          </div>
        </mat-card>
      }

      @if (isSeeding && progress) {
        <app-seeding-progress [progress]="progress" />
      }

      @if (!demoReady && !isLoading) {
        <mat-card class="error-card">
          <mat-icon>cloud_off</mat-icon>
          <h3>Demo Service Unavailable</h3>
          <p>Cannot connect to the demo seeding service. Ensure the backend is running.</p>
          <button mat-stroked-button (click)="checkStatus()">
            <mat-icon>refresh</mat-icon> Retry
          </button>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .seeding-dashboard { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header {
      margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; font-size: 24px; margin: 0; }
      .subtitle { color: var(--text-secondary); margin-top: 4px; }
    }
    .status-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .scenario-picker {
      padding: 24px;
      h3 { margin: 0 0 16px; }
    }
    .scenario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .scenario-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px !important;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--accent-cyan); }
      &.selected { border-color: var(--accent-cyan); background: rgba(0, 188, 212, 0.08) !important; }
      .scenario-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .desc { font-size: 12px; color: var(--text-secondary); }
      .count { font-size: 11px; color: var(--accent-cyan); }
      .check { color: var(--accent-cyan); }
    }
    .actions { display: flex; gap: 12px; }
    .error-card {
      padding: 32px;
      text-align: center;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--accent-red); margin-bottom: 12px; }
      h3 { margin: 0 0 8px; }
      p { color: var(--text-secondary); margin-bottom: 16px; }
    }
  `],
})
export class SeedingDashboardComponent implements OnInit, OnDestroy {
  private seedingService = inject(DemoSeedingService);
  orchestrator = inject(DemoOrchestratorService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  demoReady = false;
  isLoading = true;
  isSeeding = false;
  scenarios: DemoScenarioResponse[] = [];
  selectedScenario: string | null = null;
  progress: DemoProgressResponse | null = null;

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    this.isLoading = true;
    this.seedingService.getStatus().pipe(
      catchError(() => of(null))
    ).subscribe(status => {
      this.isLoading = false;
      if (status) {
        this.demoReady = status.ready;
        if (status.ready) this.loadScenarios();
      }
    });
  }

  loadScenarios(): void {
    this.seedingService.listScenarios().pipe(
      catchError(() => of([]))
    ).subscribe(scenarios => {
      this.scenarios = scenarios;
      if (scenarios.length === 1) this.selectedScenario = scenarios[0].name;
    });
  }

  selectScenario(name: string): void {
    this.selectedScenario = name;
  }

  startSeeding(): void {
    if (!this.selectedScenario) return;
    this.isSeeding = true;
    this.orchestrator.goToPhase('SEEDING');

    this.seedingService.loadScenario(this.selectedScenario).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || `Seeding started: ${this.selectedScenario}`,
          'OK', { duration: 3000 }
        );
        this.startPollingProgress();
      },
      error: (err) => {
        this.isSeeding = false;
        this.snackBar.open(`Seeding failed: ${err.message}`, 'Dismiss', { duration: 5000 });
        this.orchestrator.reportError(err.message);
      },
    });
  }

  private startPollingProgress(): void {
    interval(2000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.seedingService.getProgress().pipe(catchError(() => of(null)))),
    ).subscribe(progress => {
      if (!progress) return;
      this.progress = progress;

      this.orchestrator.updateProgress({
        patientsLoaded: progress.patientsPersisted || 0,
      });

      if (progress.progressPercent >= 100 || progress.stage === 'COMPLETE' || progress.stage === 'COMPLETED') {
        this.isSeeding = false;
        this.snackBar.open('Seeding complete!', 'OK', { duration: 3000 });
        this.orchestrator.goToPhase('STREAMING');
      }
    });
  }

  resetData(): void {
    this.seedingService.resetCurrentTenant().subscribe({
      next: () => {
        this.snackBar.open('Data reset complete', 'OK', { duration: 3000 });
        this.orchestrator.reset();
      },
      error: (err) => this.snackBar.open(`Reset failed: ${err.message}`, 'Dismiss', { duration: 5000 }),
    });
  }

  getScenarioIcon(scenario: DemoScenarioResponse): string {
    const name = scenario.name?.toLowerCase() || '';
    if (name.includes('full') || name.includes('all')) return 'select_all';
    if (name.includes('diabetes') || name.includes('t2dm')) return 'bloodtype';
    if (name.includes('pediatric')) return 'child_care';
    return 'science';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
