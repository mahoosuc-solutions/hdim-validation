import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrafficCaptureService } from '../../core/services/traffic-capture.service';
import { TrafficSource, TrafficDirection, createDefaultFilter } from '../../core/models/traffic.model';

interface SourceChip {
  source: TrafficSource;
  label: string;
  icon: string;
  color: string;
}

const SOURCE_CHIPS: SourceChip[] = [
  { source: 'http-interceptor', label: 'HTTP', icon: 'http', color: 'var(--accent-green)' },
  { source: 'websocket-main', label: 'WS Main', icon: 'cable', color: 'var(--accent-blue)' },
  { source: 'sse-seed', label: 'SSE', icon: 'stream', color: 'var(--accent-purple)' },
  { source: 'ws-devops', label: 'DevOps', icon: 'terminal', color: 'var(--accent-orange)' },
  { source: 'ws-health-scores', label: 'Health', icon: 'monitor_heart', color: 'var(--accent-cyan)' },
  { source: 'ws-subscriptions', label: 'Subs', icon: 'notifications', color: 'var(--text-secondary)' },
];

const PHASES = ['all', 'seeding', 'pipeline', 'analytics', 'security', 'performance', 'operations'];

@Component({
  selector: 'app-traffic-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="filter-bar">
      <!-- Source chips -->
      <div class="filter-group">
        @for (chip of sourceChips; track chip.source) {
          <button class="filter-chip"
            [class.active]="isSourceActive(chip.source)"
            [style.--chip-color]="chip.color"
            (click)="toggleSource(chip.source)"
            [matTooltip]="chip.label">
            <mat-icon>{{ chip.icon }}</mat-icon>
            <span class="chip-label">{{ chip.label }}</span>
          </button>
        }
      </div>

      <div class="filter-divider"></div>

      <!-- Direction -->
      <div class="filter-group">
        @for (dir of directions; track dir) {
          <button class="filter-chip"
            [class.active]="currentDirection === dir"
            (click)="setDirection(dir)">
            <mat-icon>{{ getDirectionIcon(dir) }}</mat-icon>
            <span class="chip-label">{{ dir | titlecase }}</span>
          </button>
        }
      </div>

      <div class="filter-divider"></div>

      <!-- Phase -->
      <div class="filter-group">
        <select class="phase-select" [ngModel]="currentPhase" (ngModelChange)="setPhase($event)">
          @for (phase of phases; track phase) {
            <option [value]="phase">{{ phase | titlecase }}</option>
          }
        </select>
      </div>

      <!-- Status -->
      <div class="filter-group">
        <select class="phase-select" [ngModel]="currentStatus" (ngModelChange)="setStatus($event)">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </div>

      <!-- Text search -->
      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input type="text" placeholder="Filter by URL, service..."
          [ngModel]="searchText" (ngModelChange)="setSearchText($event)">
      </div>

      <!-- Clear -->
      <button mat-icon-button matTooltip="Reset filters" (click)="resetFilters()">
        <mat-icon>filter_alt_off</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .filter-divider {
      width: 1px;
      height: 24px;
      background: var(--border-color);
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: var(--bg-elevated); }
      &.active {
        background: color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 15%, transparent);
        border-color: var(--chip-color, var(--accent-cyan));
        color: var(--chip-color, var(--accent-cyan));
      }
    }
    .chip-label {
      @media (max-width: 1100px) { display: none; }
    }
    .phase-select {
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      outline: none;
      option { background: var(--bg-card); }
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 3px 8px;
      flex: 1;
      min-width: 120px;
      max-width: 240px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--text-secondary); }
      input {
        border: none;
        background: none;
        color: var(--text-primary);
        font-size: 12px;
        outline: none;
        flex: 1;
        &::placeholder { color: var(--text-secondary); }
      }
    }
  `],
})
export class TrafficFilterBarComponent {
  private trafficCapture = inject(TrafficCaptureService);

  sourceChips = SOURCE_CHIPS;
  directions: (TrafficDirection | 'all')[] = ['all', 'outbound', 'inbound'];
  phases = PHASES;

  currentDirection: TrafficDirection | 'all' = 'all';
  currentPhase = 'all';
  currentStatus: 'all' | 'success' | 'error' = 'all';
  searchText = '';

  private activeSources = new Set<TrafficSource>(SOURCE_CHIPS.map(c => c.source));

  isSourceActive(source: TrafficSource): boolean {
    return this.activeSources.has(source);
  }

  toggleSource(source: TrafficSource): void {
    if (this.activeSources.has(source)) {
      this.activeSources.delete(source);
    } else {
      this.activeSources.add(source);
    }
    this.updateFilter();
  }

  setDirection(dir: TrafficDirection | 'all'): void {
    this.currentDirection = dir;
    this.updateFilter();
  }

  setPhase(phase: string): void {
    this.currentPhase = phase;
    this.updateFilter();
  }

  setStatus(status: 'all' | 'success' | 'error'): void {
    this.currentStatus = status;
    this.updateFilter();
  }

  setSearchText(text: string): void {
    this.searchText = text;
    this.updateFilter();
  }

  resetFilters(): void {
    this.activeSources = new Set(SOURCE_CHIPS.map(c => c.source));
    this.currentDirection = 'all';
    this.currentPhase = 'all';
    this.currentStatus = 'all';
    this.searchText = '';
    this.trafficCapture.setFilter(createDefaultFilter());
  }

  getDirectionIcon(dir: string): string {
    if (dir === 'outbound') return 'arrow_upward';
    if (dir === 'inbound') return 'arrow_downward';
    return 'swap_vert';
  }

  private updateFilter(): void {
    this.trafficCapture.setFilter({
      sources: new Set(this.activeSources),
      direction: this.currentDirection,
      phase: this.currentPhase,
      statusFilter: this.currentStatus,
      searchText: this.searchText,
    });
  }
}
