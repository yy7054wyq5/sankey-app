import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreMainComponent } from './components/core-main/core-main.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ShareModule } from '../share/share.module';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';
import { SiderComponent } from './components/sider/sider.component';
import { CheckNodeComponent } from './components/check-node/check-node.component';
import { CommonService } from './services/common/common.service';
import { DetailPanelComponent } from './components/detail-panel/detail-panel.component';

@NgModule({
  imports: [CommonModule, FormsModule, ShareModule, NgZorroAntdModule],
  exports: [CoreMainComponent],
  declarations: [CoreMainComponent, SearchBarComponent, SiderComponent, CheckNodeComponent, DetailPanelComponent],
  providers: [CommonService]
})
export class CoreModule {}
