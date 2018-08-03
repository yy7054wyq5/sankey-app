import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoadingService } from '../loading/loading.service';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class InterceptorsService implements HttpInterceptor {
  constructor(private _loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._loading.open();
    // 开发环境将请求延迟500ms，以查看loading效果是否有效
    return next.handle(req).pipe(
      delay(environment.requestDelayTime),
      tap(
        res => {
          this._loading.close();
        },
        error => {
          this._loading.close();
        },
        () => {
          this._loading.close();
        }
      )
    );
  }
}
