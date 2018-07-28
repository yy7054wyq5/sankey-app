import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { siderMenus, SideMenuItem } from '../../config';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {

  constructor() { }

  siderMenus: SideMenuItem[] = siderMenus;

  ngOnInit() {
  }

}
