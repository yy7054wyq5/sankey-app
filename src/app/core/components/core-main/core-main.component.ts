import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { siderMenus, SideMenuItem, chartConfig } from '../../config';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {

  constructor(
    private _http: HttpClient
  ) { }

  siderMenus: SideMenuItem[] = siderMenus;
  option = chartConfig;

  ngOnInit() {
  }

  search() {
    console.log(1);
    this._http.get('assets/mock/search-result.json').subscribe(data => {
      this.option.series[0].data = data[0].nodes;
      this.option.series[0].links = data[0].links;
      this.option = Object.assign({}, this.option);
    });

  }

}
