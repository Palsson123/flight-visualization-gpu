import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({name: 'unixFormatter'})
export class UnixFormatterPipe implements PipeTransform {
  transform(unix: number, format?: string): string {

    if (!unix) return '';

    if (format) return moment(unix * 1000).format(format);

    return moment(unix * 1000).format('YYYY-MM-DD HH:mm:ss');
  }
}