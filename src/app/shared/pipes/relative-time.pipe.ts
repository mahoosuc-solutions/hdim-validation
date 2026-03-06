import { Pipe, PipeTransform } from '@angular/core';
import { formatRelativeTime } from '../../core/models/system-event.model';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(timestamp: string | null | undefined): string {
    if (!timestamp) return '';
    return formatRelativeTime(timestamp);
  }
}
