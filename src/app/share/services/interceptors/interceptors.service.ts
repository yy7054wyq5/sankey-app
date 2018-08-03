import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { delay } from '../../../../../node_modules/rxjs/operators';
import { environment } from '../../../../environments/environment';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class InterceptorsService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(delay(environment.requestDelayTime));
  }
}
