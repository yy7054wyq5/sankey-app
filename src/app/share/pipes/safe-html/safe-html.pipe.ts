import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(str: string, argu?: string) {
    if (argu === 'html' || !argu) {
      return this.sanitizer.bypassSecurityTrustHtml(str);
    }
    if (argu === 'style') {
      return this.sanitizer.bypassSecurityTrustStyle(str);
    }
  }

}
