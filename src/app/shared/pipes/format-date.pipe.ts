import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(
    value: Timestamp | Date | undefined | null,
    format: 'short' | 'medium' | 'long' = 'medium'
  ): string {
    if (!value) return '';

    const date = value instanceof Timestamp ? value.toDate() : value;

    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { month: 'numeric', day: 'numeric' }
        : format === 'long'
          ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          : { year: 'numeric', month: 'short', day: 'numeric' };

    return date.toLocaleDateString('en-US', options);
  }
}
