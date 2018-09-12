import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreMainComponent } from './components/core-main/core-main.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ShareModule } from '../share/share.module';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';
import { CheckNodeComponent } from './components/check-node/check-node.component';

@NgModule({
  imports: [CommonModule, FormsModule, ShareModule, NgZorroAntdModule],
  exports: [CoreMainComponent],
  declarations: [CoreMainComponent, SearchBarComponent, CheckNodeComponent],
  providers: []
})
export class CoreModule {}
