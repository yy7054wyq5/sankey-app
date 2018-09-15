import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuccessSearchRecord, SearchBarComponent } from '../../../core/components/search-bar/search-bar.component';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.less']
})
export class PanelComponent implements OnInit {
  fold = false;
  // 控制个人信息展开或关闭
  userActived = false;
  // 消息历史展开或关闭
  historyActived = false;
  // 消息历史菜单
  historyMenus: SuccessSearchRecord[] = [];
  // 任务信心菜单
  personMenus = [];

  // 搜索栏组件
  @Input()
  searchBar: SearchBarComponent;
  @Input()
  justDisPerson = false;

  @Input()
  set person(data: any[]) {
    this.personMenus = data || [];
    if (data && data.length) {
      this.userActived = true;
    }
  }

  @Input()
  set histories(data: SuccessSearchRecord[]) {
    this.historyMenus = data;
  }

  @Output()
  outFoldStatus = new EventEmitter<boolean>();

  constructor(private _modal: NzModalService) {}

  ngOnInit() {}

  ///////////////////////////////

  /**
   * 菜单展开收起
   *
   * @memberof SiderComponent
   */
  folder() {
    this.fold = !this.fold;
    this.outFoldStatus.emit(this.fold);
  }

  /**
   * 点击历史搜索
   *
   * @param {SuccessSearchRecord} data
   * @memberof SiderComponent
   */
  toSearch(data: SuccessSearchRecord) {
    console.log(data);
    this.searchBar.search(data);
  }

  /**
   * 清空历史
   *
   * @memberof SiderComponent
   */
  clear() {
    if (this.historyMenus.length) {
      this._modal.confirm({
        nzWrapClassName: 'sn',
        nzTitle: '清空',
        nzContent: '您确定清除历史吗？',
        nzOnOk: () => {
          this.searchBar.clearRecords();
        }
      });
    }
  }
}
