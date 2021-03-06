import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { ShareModule } from './share/share.module';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { CoreModule } from './core/core.module';
import { httpInterceptorProviders } from './share/services/interceptors';
import {CookieService} from 'ngx-cookie-service';
import {DomainService} from './core/services/domain/domain.service';
import {StorageService} from './share/services/storage/storage.service';

registerLocaleData(zh);

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    ShareModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    NgZorroAntdModule
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }, httpInterceptorProviders, CookieService, DomainService, StorageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
