import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoStepperComponent } from './features/demo-control/demo-stepper.component';

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
export class App {}
