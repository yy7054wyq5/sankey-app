import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpEventType, HttpResponse} from '@angular/common/http';

import {Observable, Observer} from 'rxjs';
import {delay, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {LoadingService} from '../loading/loading.service';
import {DomainService} from '../../../core/services/domain/domain.service';
import {HttpHeaderResponse} from '@angular/common/http/src/response';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class InterceptorsService implements HttpInterceptor {
    constructor(private _loading: LoadingService,
                private _domainService: DomainService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this._loading.open();
        let secureReq = null;
        if (req.url.indexOf('account/wenXinAiGuanXiAccount') > -1) {
            secureReq = req.clone({url: environment.memberApiHost + req.url});
        } else {
            secureReq = req.clone({url: environment.apiHost + req.url});
        }

        // console.log(req);
        // 开发环境将请求延迟500ms，以查看loading效果是否有效
        return next.handle(secureReq).pipe(
            delay(environment.requestDelayTime),
            tap(
                (event: HttpEvent<any>) => {
                    // 授权失败
                    console.log((<HttpHeaderResponse>event).status)
                    if ((<HttpHeaderResponse>event).status && (<HttpHeaderResponse>event).status === 401) {
                        window.location.href = this._domainService.getWeiXinLoginUrl();
                    }
                    if (event instanceof HttpResponse) {
                        this._loading.close();
                    }
                },
                error => {
                    console.log(error.status)
                    if(error.status && error.status === 401)
                    {
                        window.location.href = this._domainService.getWeiXinLoginUrl();
                    }
                    this._loading.close();
                }
            )
        );
    }
}
