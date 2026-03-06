import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';
import { FhirService } from '../../core/services/fhir.service';
import { QualityMeasureService } from '../../core/services/quality-measure.service';
import { Phenotype, PhenotypeExpected, ValidationResult, PhenotypeValidation } from '../../core/models/patient.model';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { DemoOrchestratorService } from '../../core/services/demo-orchestrator.service';

@Component({
  selector: 'app-lifecycle-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MetricCardComponent, StatusIndicatorComponent,
  ],
  template: `
    <div class="lifecycle-dashboard">
      <div class="header">
        <h2><mat-icon>fact_check</mat-icon> Lifecycle Validation</h2>
        <button mat-raised-button color="primary" (click)="runValidation()" [disabled]="validating">
          <mat-icon>play_arrow</mat-icon> Run Validation
        </button>
      </div>

      <div class="summary-row">
        <app-metric-card label="Phenotypes" [value]="phenotypes.length"
          icon="science" color="var(--accent-cyan)" />
        <app-metric-card label="Passed" [value]="passedCount"
          icon="check_circle" color="var(--accent-green)" />
        <app-metric-card label="Failed" [value]="failedCount"
          icon="cancel" color="var(--accent-red)" />
        <app-metric-card label="Pending" [value]="phenotypes.length - validations.length"
          icon="pending" color="var(--accent-orange)" />
      </div>

      @if (validating) {
        <div class="loading-state">
          <mat-spinner diameter="48" />
          <p>Validating phenotypes against live data...</p>
        </div>
      }

      <div class="phenotype-grid">
        @for (phenotype of phenotypes; track phenotype.id) {
          @let validation = getValidation(phenotype.id);
          <mat-card class="phenotype-card" [class.passed]="validation?.overallPassed === true"
            [class.failed]="validation?.overallPassed === false"
            [class.pending]="!validation">
            <div class="card-header">
              <mat-icon>{{ getPhenotypeIcon(phenotype.id) }}</mat-icon>
              <div class="card-title">
                <strong>{{ phenotype.name }}</strong>
                <span class="card-id">{{ phenotype.id }}</span>
              </div>
              @if (validation) {
                <app-status-indicator
                  [status]="validation.overallPassed ? 'passed' : 'failed'"
                  [label]="validation.overallPassed ? 'PASS' : 'FAIL'" />
              } @else {
                <app-status-indicator status="pending" label="PENDING" />
              }
            </div>

            @if (validation) {
              <div class="validation-results">
                @for (result of validation.results; track result.field) {
                  <div class="result-row" [class.pass]="result.passed" [class.fail]="!result.passed">
                    <mat-icon>{{ result.passed ? 'check' : 'close' }}</mat-icon>
                    <span class="field">{{ result.field }}</span>
                    <span class="expected">{{ result.expected }}</span>
                    <span class="actual">{{ result.actual }}</span>
                  </div>
                }
              </div>
            }
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .lifecycle-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    }
    .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-secondary); }
    .phenotype-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
    .phenotype-card {
      padding: 20px !important;
      &.passed { border-color: var(--accent-green) !important; }
      &.failed { border-color: var(--accent-red) !important; }
    }
    .card-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
      mat-icon { color: var(--accent-cyan); }
    }
    .card-title { flex: 1; display: flex; flex-direction: column; }
    .card-id { font-size: 11px; color: var(--text-secondary); }
    .validation-results { display: flex; flex-direction: column; gap: 4px; }
    .result-row {
      display: grid; grid-template-columns: 24px 1fr 1fr 1fr; gap: 8px; padding: 6px 8px;
      border-radius: 4px; font-size: 12px; align-items: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &.pass { background: rgba(76, 175, 80, 0.08); mat-icon { color: var(--accent-green); } }
      &.fail { background: rgba(244, 67, 54, 0.08); mat-icon { color: var(--accent-red); } }
    }
    .field { font-weight: 500; }
    .expected { color: var(--text-secondary); }
    .actual { font-weight: 600; }
  `],
})
export class LifecycleDashboardComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private fhir = inject(FhirService);
  private qm = inject(QualityMeasureService);
  private orchestrator = inject(DemoOrchestratorService);
  private destroy$ = new Subject<void>();

  phenotypes: Phenotype[] = [];
  validations: PhenotypeValidation[] = [];
  validating = false;

  get passedCount(): number { return this.validations.filter(v => v.overallPassed).length; }
  get failedCount(): number { return this.validations.filter(v => !v.overallPassed).length; }

  ngOnInit(): void {
    this.loadManifest();
  }

  loadManifest(): void {
    this.http.get<any>('/assets/manifest.json').pipe(
      takeUntil(this.destroy$),
    ).subscribe(manifest => {
      this.phenotypes = manifest.phenotypes.map((p: any) => ({
        id: p.id,
        mrn: p.mrn,
        name: p.name,
        bundle: p.bundle,
        expected: p.expected,
      }));
    });
  }

  runValidation(): void {
    this.validating = true;
    this.validations = [];

    const validations$ = this.phenotypes.map(phenotype => {
      return this.fhir.searchPatientByMrn(phenotype.mrn || phenotype.id).pipe(
        catchError(() => of({ entry: [] } as any)),
        takeUntil(this.destroy$),
      );
    });

    forkJoin(validations$).subscribe(bundles => {
      bundles.forEach((bundle: any, idx: number) => {
        const phenotype = this.phenotypes[idx];
        const patient = bundle?.entry?.[0]?.resource;
        if (patient) {
          this.validatePhenotype(phenotype, patient.id);
        } else {
          this.validations.push({
            phenotype,
            results: [{ field: 'Patient Found', expected: 'Yes', actual: 'No', passed: false }],
            overallPassed: false,
            timestamp: new Date().toISOString(),
          });
        }
      });
      this.validating = false;
      this.orchestrator.updateProgress({
        validationsPassed: this.passedCount,
        validationsFailed: this.failedCount,
      });
    });
  }

  private validatePhenotype(phenotype: Phenotype, patientId: string): void {
    forkJoin({
      conditions: this.fhir.getConditions(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      observations: this.fhir.getObservations(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      medications: this.fhir.getMedications(patientId).pipe(catchError(() => of({ entry: [] } as any))),
      careGaps: this.qm.getCareGaps(patientId).pipe(catchError(() => of([]))),
      risk: this.qm.getRiskStratification(patientId).pipe(catchError(() => of(null))),
    }).pipe(takeUntil(this.destroy$)).subscribe(data => {
      const results: ValidationResult[] = [];
      const expected = phenotype.expected;

      if (expected.careGaps !== undefined) {
        const actual = (data.careGaps as any[])?.length || 0;
        results.push({ field: 'Care Gaps', expected: String(expected.careGaps), actual: String(actual), passed: actual === expected.careGaps });
      }
      if (expected.riskScore) {
        const actual = (data.risk as any)?.riskLevel?.toLowerCase() || 'unknown';
        results.push({ field: 'Risk Level', expected: expected.riskScore, actual, passed: actual === expected.riskScore.toLowerCase() });
      }
      if (expected.activeConditions) {
        const actualCount = (data.conditions?.entry || []).length;
        results.push({ field: 'Active Conditions', expected: String(expected.activeConditions.length), actual: String(actualCount), passed: actualCount >= expected.activeConditions.length });
      }
      if (expected.hba1c) {
        const obs = (data.observations?.entry || []).find((e: any) =>
          e.resource?.code?.coding?.some((c: any) => c.display?.toLowerCase().includes('a1c') || c.code === '4548-4')
        );
        const actual = obs?.resource?.valueQuantity?.value;
        results.push({ field: 'HbA1c', expected: `${expected.hba1c.value}%`, actual: actual ? `${actual}%` : 'N/A', passed: actual !== undefined && Math.abs(actual - expected.hba1c.value) < 0.5 });
      }
      if (expected.medicationCount) {
        const actualCount = (data.medications?.entry || []).length;
        results.push({ field: 'Medications', expected: String(expected.medicationCount), actual: String(actualCount), passed: actualCount >= expected.medicationCount });
      }

      const overallPassed = results.length > 0 && results.every(r => r.passed);
      this.validations.push({ phenotype, results, overallPassed, timestamp: new Date().toISOString() });
    });
  }

  getValidation(phenotypeId: string): PhenotypeValidation | undefined {
    return this.validations.find(v => v.phenotype.id === phenotypeId);
  }

  getPhenotypeIcon(id: string): string {
    const map: Record<string, string> = {
      't2dm-managed': 'bloodtype', 't2dm-unmanaged': 'bloodtype',
      'chf-polypharmacy': 'favorite', 'preventive-gaps': 'vaccines',
      'healthy-pediatric': 'child_care', 'multi-chronic-elderly': 'elderly',
    };
    return map[id] || 'science';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
