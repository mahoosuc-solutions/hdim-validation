import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { TrafficCaptureService } from '../services/traffic-capture.service';
import { TrafficRecord } from '../models/traffic.model';

let recordIdCounter = 0;

function estimateSize(body: unknown): number {
  if (body == null) return 0;
  if (typeof body === 'string') return body.length;
  try {
    return JSON.stringify(body).length;
  } catch {
    return 0;
  }
}

function truncateBody(body: unknown, maxBytes = 10240): unknown {
  if (body == null) return null;
  try {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    if (str.length <= maxBytes) return body;
    return str.slice(0, maxBytes) + '...[truncated]';
  } catch {
    return '[binary/unparseable]';
  }
}

function extractHeaders(headers: { keys(): string[]; get(name: string): string | null }): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of headers.keys()) {
    const val = headers.get(key);
    if (val) result[key] = val;
  }
  return result;
}

export const trafficCaptureInterceptor: HttpInterceptorFn = (req, next) => {
  const capture = inject(TrafficCaptureService);
  const startTime = Date.now();
  const reqHeaders = extractHeaders(req.headers);
  const reqBody = req.body;
  const reqSize = estimateSize(reqBody);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const record: TrafficRecord = {
          id: `http-${++recordIdCounter}`,
          timestamp: startTime,
          source: 'http-interceptor',
          direction: 'outbound',
          method: req.method,
          url: req.urlWithParams,
          statusCode: event.status,
          requestHeaders: reqHeaders,
          responseHeaders: extractHeaders(event.headers),
          requestBody: truncateBody(reqBody),
          responseBody: truncateBody(event.body),
          durationMs: Date.now() - startTime,
          requestSize: reqSize,
          responseSize: estimateSize(event.body),
          annotation: { phase: '', action: '', service: '', importance: 'low' },
        };
        capture.capture(record);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const record: TrafficRecord = {
        id: `http-${++recordIdCounter}`,
        timestamp: startTime,
        source: 'http-interceptor',
        direction: 'outbound',
        method: req.method,
        url: req.urlWithParams,
        statusCode: error.status,
        requestHeaders: reqHeaders,
        responseHeaders: error.headers ? extractHeaders(error.headers) : undefined,
        requestBody: truncateBody(reqBody),
        responseBody: error.message,
        durationMs: Date.now() - startTime,
        requestSize: reqSize,
        responseSize: 0,
        annotation: { phase: '', action: '', service: '', importance: 'low' },
      };
      capture.capture(record);
      return throwError(() => error);
    }),
  );
};
