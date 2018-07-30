import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { siderMenus, SideMenuItem } from '../../config';


@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.less'],
})
export class SiderComponent implements OnInit {

  open = false;
  siderMenus: SideMenuItem[] = siderMenus;

  constructor() { }

  ngOnInit() {
  }

}
