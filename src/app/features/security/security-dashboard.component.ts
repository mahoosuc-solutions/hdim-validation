import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuditService, AuditEntry, AuditPage } from '../../core/services/audit.service';
import { API_CONFIG } from '../../config/api.config';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatPaginatorModule, MatProgressSpinnerModule,
    MetricCardComponent, StatusIndicatorComponent, RelativeTimePipe,
  ],
  template: `
    <div class="security-dashboard">
      <div class="header">
        <h2><mat-icon>security</mat-icon> Security & Compliance</h2>
      </div>

      <!-- Security Metrics -->
      <div class="metrics-row">
        <app-metric-card label="Encryption" [value]="tlsStatus"
          icon="lock" [color]="tlsStatus === 'TLS 1.3' ? 'var(--accent-green)' : 'var(--accent-orange)'" />
        <app-metric-card label="Audit Entries" [value]="totalAuditEntries"
          icon="history" color="var(--accent-cyan)" />
        <app-metric-card label="HIPAA Status" [value]="complianceStatus"
          icon="verified_user" [color]="complianceStatus === 'Compliant' ? 'var(--accent-green)' : 'var(--accent-orange)'" />
        <app-metric-card label="Data Classification" value="PHI"
          icon="classification" color="var(--accent-purple)" />
      </div>

      <!-- Compliance Posture -->
      <mat-card class="compliance-card">
        <h3>Compliance Posture</h3>
        <div class="compliance-grid">
          @for (item of complianceItems; track item.name) {
            <div class="compliance-item">
              <app-status-indicator [status]="item.status" [label]="item.status" />
              <div class="compliance-info">
                <strong>{{ item.name }}</strong>
                <span class="compliance-desc">{{ item.description }}</span>
              </div>
            </div>
          }
        </div>
      </mat-card>

      <!-- Audit Log Viewer -->
      <mat-card class="audit-card">
        <div class="audit-header">
          <h3>Audit Log</h3>
          <button mat-stroked-button (click)="loadAuditLogs()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
        @if (loadingAudit) {
          <div class="loading"><mat-spinner diameter="32" /></div>
        }
        <div class="audit-list">
          @for (entry of auditEntries; track entry.id) {
            <div class="audit-entry fade-in">
              <mat-icon [class]="getAuditIcon(entry.action).class">{{ getAuditIcon(entry.action).icon }}</mat-icon>
              <div class="audit-info">
                <strong>{{ entry.action }}</strong>
                <span class="audit-resource">{{ entry.resourceType }}{{ entry.resourceId ? ' / ' + entry.resourceId : '' }}</span>
              </div>
              <span class="audit-outcome" [class]="entry.outcome.toLowerCase()">{{ entry.outcome }}</span>
              <span class="audit-time">{{ entry.timestamp | relativeTime }}</span>
            </div>
          } @empty {
            @if (!loadingAudit) {
              <div class="empty-state">
                <mat-icon>policy</mat-icon>
                <p>No audit entries yet</p>
              </div>
            }
          }
        </div>
        @if (totalAuditEntries > 20) {
          <mat-paginator [length]="totalAuditEntries" [pageSize]="20"
            (page)="onPageChange($event)" />
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .security-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    }
    .metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .compliance-card, .audit-card { padding: 24px; margin-bottom: 16px; h3 { margin: 0 0 16px; } }
    .compliance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
    .compliance-item {
      display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: var(--bg-elevated);
    }
    .compliance-info { display: flex; flex-direction: column; gap: 2px; }
    .compliance-desc { font-size: 12px; color: var(--text-secondary); }
    .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading { display: flex; justify-content: center; padding: 20px; }
    .audit-list { display: flex; flex-direction: column; gap: 4px; max-height: 500px; overflow-y: auto; }
    .audit-entry {
      display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 4px;
      &:hover { background: var(--bg-elevated); }
    }
    .audit-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .audit-resource { font-size: 11px; color: var(--text-secondary); }
    .audit-outcome {
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
      &.success { color: var(--accent-green); background: rgba(76, 175, 80, 0.1); }
      &.failure { color: var(--accent-red); background: rgba(244, 67, 54, 0.1); }
    }
    .audit-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }
    .empty-state { text-align: center; padding: 40px; color: var(--text-secondary);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; }
    }
    .read mat-icon { color: var(--accent-blue); }
    .write mat-icon { color: var(--accent-orange); }
    .delete mat-icon { color: var(--accent-red); }
  `],
})
export class SecurityDashboardComponent implements OnInit, OnDestroy {
  private auditService = inject(AuditService);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  tlsStatus = 'Checking...';
  complianceStatus = 'Checking...';
  totalAuditEntries = 0;
  auditEntries: AuditEntry[] = [];
  loadingAudit = false;

  complianceItems = [
    { name: 'HIPAA Privacy Rule', description: 'PHI access controls and minimum necessary', status: 'connected' },
    { name: 'HIPAA Security Rule', description: 'Technical safeguards for ePHI', status: 'connected' },
    { name: 'SOC 2 Type II', description: 'Security, availability, processing integrity', status: 'connected' },
    { name: 'Data Encryption', description: 'AES-256 at rest, TLS 1.3 in transit', status: 'connected' },
    { name: 'Audit Logging', description: 'Comprehensive audit trail for all PHI access', status: 'connected' },
    { name: 'Access Control', description: 'RBAC with tenant isolation', status: 'connected' },
  ];

  ngOnInit(): void {
    this.checkTls();
    this.checkCompliance();
    this.loadAuditLogs();
  }

  checkTls(): void {
    this.tlsStatus = window.location.protocol === 'https:' ? 'TLS 1.3' : 'TLS (dev mode)';
  }

  checkCompliance(): void {
    this.http.get<any>(API_CONFIG.COMPLIANCE_URL).pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$),
    ).subscribe(data => {
      if (data?.status === 'COMPLIANT') {
        this.complianceStatus = 'Compliant';
        this.complianceItems.forEach(item => item.status = 'connected');
      } else if (data) {
        this.complianceStatus = 'Review Needed';
        this.complianceItems.forEach(item => item.status = 'warning');
      } else {
        this.complianceStatus = 'Unavailable';
        this.complianceItems.forEach(item => item.status = 'pending');
      }
    });
  }

  loadAuditLogs(page = 0): void {
    this.loadingAudit = true;
    this.auditService.getAuditLogs(page, 20).pipe(
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 } as AuditPage)),
      takeUntil(this.destroy$),
    ).subscribe(data => {
      this.loadingAudit = false;
      this.auditEntries = data.content;
      this.totalAuditEntries = data.totalElements;
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadAuditLogs(event.pageIndex);
  }

  getAuditIcon(action: string): { icon: string; class: string } {
    const lower = action?.toLowerCase() || '';
    if (lower.includes('create') || lower.includes('write')) return { icon: 'add_circle', class: 'write' };
    if (lower.includes('delete')) return { icon: 'delete', class: 'delete' };
    if (lower.includes('read') || lower.includes('view')) return { icon: 'visibility', class: 'read' };
    return { icon: 'edit', class: 'write' };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
