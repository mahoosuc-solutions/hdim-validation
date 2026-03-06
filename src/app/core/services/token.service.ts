import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly hasToken = signal(!!sessionStorage.getItem(STORAGE_KEY));

  getToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEY, token);
    this.hasToken.set(true);
  }

  clearToken(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.hasToken.set(false);
  }
}
