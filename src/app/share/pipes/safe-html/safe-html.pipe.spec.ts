import { SafeHtmlPipe } from './safe-html.pipe';
import { DomSanitizerImpl } from '@angular/platform-browser/src/security/dom_sanitization_service';

const _doc = '<div></div>';

describe('SafeHtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe(new DomSanitizerImpl(_doc));
    expect(pipe).toBeTruthy();
  });
});
