import { Component, OnInit, ViewEncapsulation, Input, Output } from '@angular/core';
import { siderMenus, SideMenuItem } from '../../config';
import { SuccessSearchRecord, SearchBarComponent } from '../search-bar/search-bar.component';

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

  constructor() {}

  ngOnInit() {}
}
