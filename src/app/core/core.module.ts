import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreMainComponent } from './components/core-main/core-main.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ShareModule } from '../share/share.module';
import { SearchBarComponent } from './components/search-bar/search-bar.component';

@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgZorroAntdModule
  ],
  exports: [
    CoreMainComponent
  ],
  declarations: [CoreMainComponent, SearchBarComponent]
})
export class CoreModule { }
