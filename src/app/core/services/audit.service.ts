import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  tenantId?: string;
  outcome: string;
  details?: Record<string, any>;
}

export interface AuditPage {
  content: AuditEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly baseUrl = API_CONFIG.AUDIT_URL;

  constructor(private http: HttpClient) {}

  getAuditLogs(page = 0, size = 20): Observable<AuditPage> {
    return this.http.get<AuditPage>(this.baseUrl, {
      params: { page: String(page), size: String(size), sort: 'timestamp,desc' },
    });
  }

  getAuditLogsByResource(resourceType: string, page = 0, size = 20): Observable<AuditPage> {
    return this.http.get<AuditPage>(`${this.baseUrl}/resource/${resourceType}`, {
      params: { page: String(page), size: String(size) },
    });
  }
}
