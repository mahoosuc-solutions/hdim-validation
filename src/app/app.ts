import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoStepperComponent } from './features/demo-control/demo-stepper.component';
import { TokenService } from './core/services/token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DemoStepperComponent],
  template: `
    <div class="app-shell">
      <app-demo-stepper />
      <main class="app-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-primary);
    }
    .app-content {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class App implements OnInit {
  private tokenService = inject(TokenService);

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      this.tokenService.setToken(token);
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }
}
