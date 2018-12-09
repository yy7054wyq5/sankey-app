import {Injectable} from '@angular/core';

@Injectable()
export class DomainService {

    constructor() {
    }

    getCookieDomain(): string {
        const domain = window.location.hostname;
        const exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        const reg = domain.match(exp);
        if(reg == null) {
            return domain.substring(domain.indexOf('.'), domain.length);
        }else{
            return domain;
        }
    }

    getWeiXinLoginUrl(): string {
        const state = window.location.hostname;
        return `https://open.weixin.qq.com/connect/qrconnect?appid=wx3071d332c697c20d&redirect_uri=https%3a%2f%2fapp-relation.buyint.com%2faiguanxi%2f%23%2f&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    }

    isAiGuanXiDomain(): boolean{
        return this.getCookieDomain().indexOf('aiguanxi') > -1
    }
}
