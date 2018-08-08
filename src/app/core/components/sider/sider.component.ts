import { Component, OnInit, ViewEncapsulation, Input, Output } from '@angular/core';
import { SuccessSearchRecord, SearchBarComponent } from '../search-bar/search-bar.component';
import { NzModalService } from '../../../../../node_modules/ng-zorro-antd';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.less']
})
export class SiderComponent implements OnInit {
  open = false;
  userActived = false;
  historyActived = false;
  historyMenus: SuccessSearchRecord[] = [];
  personMenus = {};

  @Input() searchBar: SearchBarComponent;

  @Input()
  set person(data: any) {
    this.personMenus = data;
    if (data) {
      this.userActived = true;
      // this._cutDesc(data['描述']);
    }
  }

  @Input()
  set histories(data: SuccessSearchRecord[]) {
    this.historyMenus = data;
  }

  constructor(private _modal: NzModalService) {}

  ngOnInit() {}

  ///////////////////////////////

  private _cutDesc(data: string): { desc: string; works: string[] } {
    const _desc = data.split('。');
    const desc = [];
    _desc.forEach((des: string, index: number) => {
      if (index !== _desc.length - 1) {
        desc.push(des);
      }
    });

    console.log(_desc);

    return {
      desc: desc.join(',') + '。',
      works: []
    };
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
