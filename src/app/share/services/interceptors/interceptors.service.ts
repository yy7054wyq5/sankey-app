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
    if (environment.production && !environment.apiHost) {
      environment.apiHost = 'http://match.aimer.ai';
    }
    this._loading.open();
    req.clone({ url: environment.apiHost + req.url });
    // console.log(req);
    // 开发环境将请求延迟500ms，以查看loading效果是否有效
    return Observable.create((ob: Observer<HttpEvent<any>>) => {
      next
        .handle(req)
        .pipe(delay(environment.requestDelayTime))
        .subscribe(
          (res: HttpEvent<any>) => {
            if (res instanceof HttpResponse) {
              ob.next(res);
              ob.complete();
              this._loading.close();
            }
          },
          error => {
            this._loading.close();
          }
        );
    });
  }
}
