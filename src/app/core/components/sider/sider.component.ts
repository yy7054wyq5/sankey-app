import { Component, OnInit, ViewEncapsulation, Input, Output } from '@angular/core';
import { siderMenus, SideMenuItem } from '../../config';
import { SuccessSearchRecord, SearchBarComponent } from '../search-bar/search-bar.component';
import { NzModalService } from '../../../../../node_modules/ng-zorro-antd';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.less']
})
export class SiderComponent implements OnInit {
  open = false;
  siderMenus: SideMenuItem[] = siderMenus;

  historyMenus: SuccessSearchRecord[] = [];

  @Input() searchBar: SearchBarComponent;

  @Input()
  set histories(data: SuccessSearchRecord[]) {
    this.historyMenus = data;
  }

  constructor(private _modal: NzModalService) {}

  ngOnInit() {}

  ///////////////////////////////

  clear() {
    if (this.historyMenus.length) {
      this._modal.confirm({
        nzTitle: '清空',
        nzContent: '您确定清除历史吗？',
        nzOnOk: () => {
          this.searchBar.clearRecords();
        }
      });
    }
  }
}
