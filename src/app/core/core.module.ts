import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreMainComponent } from './components/core-main/core-main.component';
import { NgZorroAntdModule } from '../../../node_modules/ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule
  ],
  exports: [
    CoreMainComponent
  ],
  declarations: [CoreMainComponent]
})
export class CoreModule { }
