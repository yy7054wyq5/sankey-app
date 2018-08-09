import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';

import { Observable, Observer } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoadingService } from '../loading/loading.service';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class InterceptorsService implements HttpInterceptor {
  constructor(private _loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._loading.open();
    const secureReq = req.clone({ url: environment.apiHost + req.url });
    // console.log(req);
    // 开发环境将请求延迟500ms，以查看loading效果是否有效
    return next.handle(secureReq).pipe(
      delay(environment.requestDelayTime),
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this._loading.close();
          }
        },
        error => {
          this._loading.close();
        }
      )
    );
  }
}
