import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components/layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule } from 'ng-zorro-antd';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NgZorroAntdModule
  ],
  declarations: [LayoutComponent]
})
export class ShareModule { }
