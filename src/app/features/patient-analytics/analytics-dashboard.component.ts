import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { FhirService, FhirBundle } from '../../core/services/fhir.service';
import { QualityMeasureService, RiskStratification, CareGap } from '../../core/services/quality-measure.service';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

interface PatientSummary {
  id: string;
  name: string;
  mrn?: string;
  birthDate?: string;
  gender?: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MetricCardComponent, StatusIndicatorComponent, RelativeTimePipe,
  ],
  template: `
    <div class="analytics-dashboard">
      <div class="header">
        <h2><mat-icon>analytics</mat-icon> Patient Analytics</h2>
        <button mat-stroked-button (click)="loadPatients()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- Patient Selector -->
      <mat-card class="patient-selector">
        <h3>Select Patient</h3>
        @if (loading) {
          <div class="loading"><mat-spinner diameter="32" /></div>
        }
        <div class="patient-chips">
          @for (patient of patients; track patient.id) {
            <mat-chip-option [selected]="selectedPatient?.id === patient.id"
              (selectionChange)="selectPatient(patient)">
              {{ patient.name }} {{ patient.mrn ? '(' + patient.mrn + ')' : '' }}
            </mat-chip-option>
          } @empty {
            @if (!loading) {
              <p class="empty">No patients found. Seed data first.</p>
            }
          }
        </div>
      </mat-card>

      @if (selectedPatient) {
        <!-- Patient Overview -->
        <div class="metrics-row">
          <app-metric-card label="Risk Level" [value]="riskData?.riskLevel || 'N/A'"
            icon="warning" [color]="getRiskColor(riskData?.riskLevel)" />
          <app-metric-card label="Risk Score" [value]="riskData?.riskScore?.toFixed(1) || '—'"
            icon="trending_up" color="var(--accent-orange)" />
          <app-metric-card label="Care Gaps" [value]="careGaps.length"
            icon="report_problem" [color]="careGaps.length > 0 ? 'var(--accent-red)' : 'var(--accent-green)'" />
          <app-metric-card label="Conditions" [value]="conditions.length"
            icon="healing" color="var(--accent-purple)" />
        </div>

        <!-- Clinical Timeline -->
        <mat-card class="timeline-card">
          <h3>Clinical Timeline</h3>
          <div class="timeline">
            @for (encounter of encounters; track $index) {
              <div class="timeline-item fade-in">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>{{ encounter.resource?.type?.[0]?.text || encounter.resource?.class?.display || 'Encounter' }}</strong>
                  <span class="timeline-date">{{ encounter.resource?.period?.start | relativeTime }}</span>
                  @if (encounter.resource?.reasonCode?.[0]?.text) {
                    <span class="timeline-reason">{{ encounter.resource.reasonCode[0].text }}</span>
                  }
                </div>
              </div>
            } @empty {
              <p class="empty">No encounters found</p>
            }
          </div>
        </mat-card>

        <!-- Care Gaps -->
        @if (careGaps.length > 0) {
          <mat-card class="care-gaps-card">
            <h3>Open Care Gaps</h3>
            <div class="care-gap-list">
              @for (gap of careGaps; track gap.id) {
                <div class="care-gap-item" [class]="gap.priority.toLowerCase()">
                  <mat-icon>{{ gap.priority === 'HIGH' || gap.priority === 'CRITICAL' ? 'error' : 'warning' }}</mat-icon>
                  <div class="gap-info">
                    <strong>{{ gap.title }}</strong>
                    <span class="gap-desc">{{ gap.description }}</span>
                    <span class="gap-meta">{{ gap.gapType }} | {{ gap.status }}</span>
                  </div>
                  <app-status-indicator [status]="gap.priority.toLowerCase()" [label]="gap.priority" />
                </div>
              }
            </div>
          </mat-card>
        }

        <!-- Conditions -->
        <mat-card class="conditions-card">
          <h3>Active Conditions</h3>
          <div class="condition-list">
            @for (cond of conditions; track $index) {
              <div class="condition-item">
                <mat-icon>healing</mat-icon>
                <span>{{ cond.resource?.code?.text || cond.resource?.code?.coding?.[0]?.display || 'Unknown' }}</span>
              </div>
            } @empty {
              <p class="empty">No active conditions</p>
            }
          </div>
        </mat-card>

        <!-- Observations -->
        <mat-card class="obs-card">
          <h3>Recent Observations</h3>
          <div class="obs-list">
            @for (obs of observations; track $index) {
              <div class="obs-item">
                <span class="obs-name">{{ obs.resource?.code?.text || obs.resource?.code?.coding?.[0]?.display || 'Observation' }}</span>
                <span class="obs-value">
                  {{ obs.resource?.valueQuantity?.value?.toFixed(1) || obs.resource?.valueString || '—' }}
                  {{ obs.resource?.valueQuantity?.unit || '' }}
                </span>
                <span class="obs-date">{{ obs.resource?.effectiveDateTime | relativeTime }}</span>
              </div>
            } @empty {
              <p class="empty">No observations found</p>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .analytics-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    }
    .patient-selector { padding: 24px; margin-bottom: 24px; h3 { margin: 0 0 12px; } }
    .patient-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .loading { display: flex; justify-content: center; padding: 20px; }
    .metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .empty { color: var(--text-secondary); font-size: 13px; }

    .timeline-card, .care-gaps-card, .conditions-card, .obs-card { padding: 24px; margin-bottom: 16px; h3 { margin: 0 0 16px; } }

    .timeline { padding-left: 20px; border-left: 2px solid var(--border-color); }
    .timeline-item { position: relative; padding: 0 0 20px 20px; }
    .timeline-dot {
      position: absolute; left: -27px; top: 4px;
      width: 12px; height: 12px; border-radius: 50%; background: var(--accent-cyan); border: 2px solid var(--bg-card);
    }
    .timeline-content { display: flex; flex-direction: column; gap: 2px; }
    .timeline-date, .timeline-reason { font-size: 12px; color: var(--text-secondary); }

    .care-gap-list, .condition-list { display: flex; flex-direction: column; gap: 8px; }
    .care-gap-item {
      display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: var(--bg-elevated);
      &.high mat-icon, &.critical mat-icon { color: var(--accent-red); }
      &.medium mat-icon { color: var(--accent-orange); }
      &.low mat-icon { color: var(--accent-blue); }
    }
    .gap-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .gap-desc { font-size: 12px; color: var(--text-secondary); }
    .gap-meta { font-size: 11px; color: var(--text-secondary); }

    .condition-item {
      display: flex; align-items: center; gap: 8px; padding: 8px;
      mat-icon { color: var(--accent-purple); font-size: 18px; width: 18px; height: 18px; }
    }

    .obs-list { display: flex; flex-direction: column; gap: 4px; }
    .obs-item {
      display: grid; grid-template-columns: 1fr auto auto; gap: 12px; padding: 8px; border-radius: 4px;
      &:hover { background: var(--bg-elevated); }
    }
    .obs-name { font-size: 13px; }
    .obs-value { font-weight: 600; color: var(--accent-cyan); }
    .obs-date { font-size: 11px; color: var(--text-secondary); }
  `],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private fhir = inject(FhirService);
  private qm = inject(QualityMeasureService);
  private destroy$ = new Subject<void>();

  loading = false;
  patients: PatientSummary[] = [];
  selectedPatient: PatientSummary | null = null;
  riskData: RiskStratification | null = null;
  careGaps: CareGap[] = [];
  conditions: any[] = [];
  encounters: any[] = [];
  observations: any[] = [];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.fhir.getPatients(20).pipe(
      catchError(() => of({ resourceType: 'Bundle', type: 'searchset', entry: [] } as FhirBundle)),
      takeUntil(this.destroy$),
    ).subscribe(bundle => {
      this.loading = false;
      this.patients = (bundle.entry || []).map(e => {
        const r = e.resource;
        const name = r?.name?.[0];
        return {
          id: r?.id || '',
          name: name ? `${name.given?.join(' ') || ''} ${name.family || ''}`.trim() : 'Unknown',
          mrn: r?.identifier?.find((i: any) => i.type?.coding?.[0]?.code === 'MR')?.value,
          birthDate: r?.birthDate,
          gender: r?.gender,
        };
      });
      if (this.patients.length > 0 && !this.selectedPatient) {
        this.selectPatient(this.patients[0]);
      }
    });
  }

  selectPatient(patient: PatientSummary): void {
    this.selectedPatient = patient;
    this.loadPatientData(patient.id);
  }

  private loadPatientData(patientId: string): void {
    forkJoin({
      conditions: this.fhir.getConditions(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      encounters: this.fhir.getEncounters(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      observations: this.fhir.getObservations(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      risk: this.qm.getRiskStratification(patientId).pipe(catchError(() => of(null))),
      careGaps: this.qm.getCareGaps(patientId).pipe(catchError(() => of([]))),
    }).pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.conditions = data.conditions?.entry || [];
      this.encounters = data.encounters?.entry || [];
      this.observations = data.observations?.entry || [];
      this.riskData = data.risk;
      this.careGaps = data.careGaps || [];
    });
  }

  getRiskColor(level?: string): string {
    if (!level) return 'var(--text-secondary)';
    const map: Record<string, string> = { low: 'var(--accent-green)', moderate: 'var(--accent-orange)', high: 'var(--accent-red)' };
    return map[level.toLowerCase()] || 'var(--text-secondary)';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
