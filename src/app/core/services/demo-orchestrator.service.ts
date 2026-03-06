import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type DemoPhase =
  | 'IDLE'
  | 'SEEDING'
  | 'STREAMING'
  | 'PROCESSING'
  | 'PATIENT_ANALYTICS'
  | 'LIFECYCLE'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'OPERATIONS'
  | 'COMPLETE';

export interface DemoProgress {
  patientsLoaded: number;
  eventsProcessed: number;
  validationsPassed: number;
  validationsFailed: number;
  startedAt?: string;
  completedAt?: string;
}

export interface DemoStep {
  phase: DemoPhase;
  label: string;
  icon: string;
  route: string;
  autoAdvance: boolean;
}

export const DEMO_STEPS: DemoStep[] = [
  { phase: 'IDLE', label: 'Ready', icon: 'home', route: '/seeding', autoAdvance: false },
  { phase: 'SEEDING', label: 'Data Seeding', icon: 'cloud_upload', route: '/seeding', autoAdvance: true },
  { phase: 'STREAMING', label: 'Streaming', icon: 'stream', route: '/pipeline', autoAdvance: true },
  { phase: 'PROCESSING', label: 'Processing', icon: 'sync', route: '/pipeline', autoAdvance: false },
  { phase: 'PATIENT_ANALYTICS', label: 'Patient Analytics', icon: 'analytics', route: '/analytics', autoAdvance: false },
  { phase: 'LIFECYCLE', label: 'Lifecycle', icon: 'fact_check', route: '/lifecycle', autoAdvance: false },
  { phase: 'SECURITY', label: 'Security', icon: 'security', route: '/security', autoAdvance: false },
  { phase: 'PERFORMANCE', label: 'Performance', icon: 'speed', route: '/performance', autoAdvance: false },
  { phase: 'OPERATIONS', label: 'Operations', icon: 'monitor_heart', route: '/operations', autoAdvance: false },
  { phase: 'COMPLETE', label: 'Complete', icon: 'check_circle', route: '/operations', autoAdvance: false },
];

@Injectable({ providedIn: 'root' })
export class DemoOrchestratorService {
  private phaseSubject = new BehaviorSubject<DemoPhase>('IDLE');
  private progressSubject = new BehaviorSubject<DemoProgress>({
    patientsLoaded: 0,
    eventsProcessed: 0,
    validationsPassed: 0,
    validationsFailed: 0,
  });
  private errorSubject = new Subject<string>();

  public currentPhase$ = this.phaseSubject.asObservable();
  public progress$ = this.progressSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  get currentPhase(): DemoPhase {
    return this.phaseSubject.value;
  }

  get currentStepIndex(): number {
    return DEMO_STEPS.findIndex(s => s.phase === this.phaseSubject.value);
  }

  get steps(): DemoStep[] {
    return DEMO_STEPS;
  }

  canAdvance(): boolean {
    const idx = this.currentStepIndex;
    return idx >= 0 && idx < DEMO_STEPS.length - 1;
  }

  canGoBack(): boolean {
    return this.currentStepIndex > 0;
  }

  advance(): void {
    if (!this.canAdvance()) return;
    const nextPhase = DEMO_STEPS[this.currentStepIndex + 1].phase;
    this.phaseSubject.next(nextPhase);
  }

  goBack(): void {
    if (!this.canGoBack()) return;
    const prevPhase = DEMO_STEPS[this.currentStepIndex - 1].phase;
    this.phaseSubject.next(prevPhase);
  }

  goToPhase(phase: DemoPhase): void {
    this.phaseSubject.next(phase);
  }

  goToStep(index: number): void {
    if (index >= 0 && index < DEMO_STEPS.length) {
      this.phaseSubject.next(DEMO_STEPS[index].phase);
    }
  }

  updateProgress(partial: Partial<DemoProgress>): void {
    this.progressSubject.next({ ...this.progressSubject.value, ...partial });
  }

  reportError(message: string): void {
    this.errorSubject.next(message);
  }

  reset(): void {
    this.phaseSubject.next('IDLE');
    this.progressSubject.next({
      patientsLoaded: 0,
      eventsProcessed: 0,
      validationsPassed: 0,
      validationsFailed: 0,
    });
  }

  startDemo(): void {
    this.phaseSubject.next('SEEDING');
    this.progressSubject.next({
      ...this.progressSubject.value,
      startedAt: new Date().toISOString(),
    });
  }
}
