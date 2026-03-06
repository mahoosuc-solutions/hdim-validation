import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-animated-counter',
  standalone: true,
  template: `<span>{{ displayValue }}</span>`,
  styles: [`span { font-variant-numeric: tabular-nums; }`],
})
export class AnimatedCounterComponent implements OnChanges {
  @Input() value = 0;
  @Input() duration = 500;
  @Input() decimals = 0;
  @Input() suffix = '';

  displayValue = '0';
  private animationFrame?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.animateTo(changes['value'].previousValue || 0, changes['value'].currentValue);
    }
  }

  private animateTo(from: number, to: number): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      this.displayValue = current.toFixed(this.decimals) + this.suffix;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }
}
