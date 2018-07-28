import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreMainComponent } from './components/core-main/core-main.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ShareModule } from '../share/share.module';

@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgZorroAntdModule
  ],
  exports: [
    CoreMainComponent
  ],
  declarations: [CoreMainComponent]
})
export class CoreModule { }
