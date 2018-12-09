///<reference path="../../node_modules/@angular/core/src/metadata/directives.d.ts"/>
import {Component, OnInit, Renderer2, OnDestroy} from '@angular/core';
import {RemService} from './share/services/rem/rem.service';
import {Title} from '@angular/platform-browser';
import {CookieService} from 'ngx-cookie-service';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import * as qs from 'querystring';
import {environment} from 'src/environments/environment';
import {DomainService} from './core/services/domain/domain.service';
import { StorageService } from './share/services/storage/storage.service';

const searchPersonApi = '/api/account/wenXinAiGuanXiAccount/weixinLogin/';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
    _unlistenWindowResize: any;

    constructor(
        private _title: Title,
        private _rem: RemService,
        private _renderer: Renderer2,
        private _cookieService: CookieService,
        private _activatedRoute: ActivatedRoute,
        private _httpClient: HttpClient,
        private _domainService: DomainService,
        private _storage: StorageService,
    ) {
    }

    ngOnInit() {
        this._rem.setDpr();
        this._title.setTitle('Ai关系');
        this._unlistenWindowResize = this._renderer.listen('window', 'resize', () => {
            this._rem.setDpr();
        });
        const _date = new Date();
        _date.setDate(_date.getDate() + 30);
        _date.toUTCString();
        if (environment.production) {
            this.weixinLogin();
        } else {
            this._storage.put('avatarUrl', '/assets/images/icon-fullscreen.png');
            this._storage.put('nickName', '开发。。。。');
            console.log(this._domainService.getCookieDomain())
            document.cookie = `token=${environment.tmpToken};expires=${_date};domain=${this._domainService.getCookieDomain()};path=/`;
        }
    }

    ngOnDestroy() {
        this._unlistenWindowResize();
    }

    weixinLogin() {
        let code = '';
        let state = ''
        if (window.location.href.indexOf('?') > -1) {
            const params = qs.parse(window.location.href.split('?')[1]);
            console.log(params);
            code = <string>params['code'];
            state = <string>params['state'];
        }
        if (state != '' && state.indexOf('buyint.com') <= -1 && !this._domainService.isAiGuanXiDomain()) {
            window.location.href = window.location.href
                .replace("buyint.com", "aiguanxi.ai")
                .replace("https","http")
                .replace("app-relation","www");
            return;
        }
        if (code && code !== '') {
            this._httpClient.get<ResponseBase<UserEntity>>(searchPersonApi + code).subscribe(data => {
                const _date = new Date();
                _date.setHours(_date.getHours() + 2);
                _date.toUTCString();
                this._storage.put('avatarUrl', data.data.avatarUrl);
                this._storage.put('nickName', data.data.nickName);
                this._cookieService.set('token', data.data.token, _date, '/', this._domainService.getCookieDomain());
                window.location.href = window.location.href.split('?')[0];
                if (!this._cookieService.check('token')) {
                    window.location.href = this._domainService.getWeiXinLoginUrl();
                }
            });
        } else {
            console.log(this._cookieService.check('token'));
            if (!this._cookieService.check('token')) {
                window.location.href = this._domainService.getWeiXinLoginUrl();
            }
        }
    }
}

class ResponseBase<T> {
    private _code: string;
    private _message: string;
    private _data: T;

    get code(): string {
        return this._code;
    }

    set code(value: string) {
        this._code = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get data(): T {
        return this._data;
    }

    set data(value: T) {
        this._data = value;
    }
}

class UserEntity {
    private _avatarUrl: string;
    private _nickName: string;
    private _phoneNumber: string;
    private _token: string;

    get avatarUrl(): string {
        return this._avatarUrl;
    }

    set avatarUrl(value: string) {
        this._avatarUrl = value;
    }

    get nickName(): string {
        return this._nickName;
    }

    set nickName(value: string) {
        this._nickName = value;
    }

    get phoneNumber(): string {
        return this._phoneNumber;
    }

    set phoneNumber(value: string) {
        this._phoneNumber = value;
    }

    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }
}
