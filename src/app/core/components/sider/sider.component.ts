import { Component, OnInit } from '@angular/core';
import { siderMenus, SideMenuItem} from '../../config';


@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.less']
})
export class SiderComponent implements OnInit {

  siderMenus: SideMenuItem[] = siderMenus;

  constructor() { }

  ngOnInit() {
  }

}
