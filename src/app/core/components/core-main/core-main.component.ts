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

  option: any;
  siderMenus: SideMenuItem[] = siderMenus;

  ngOnInit() {
  }

  /////////////////////////

  search() {
    this._http.get('assets/mock/search-result.json').subscribe(data => {
      const _chartConfig = chartConfig;
      _chartConfig.series[0].data = data[0].nodes;
      _chartConfig.series[0].links = data[0].links;
      this.option = _chartConfig;
    });
  }

  mouseoverChartEvent(data) {
    console.log('over', data);
  }
  clickChartEvent(data) {
    console.log('click', data);
  }

}
