import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { siderMenus, SideMenuItem, chartOption, chartColorConfig } from '../../config';
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

  option: any; // 图表配置项
  colorBar = chartColorConfig;
  initCore = true; // 初始状态

  ngOnInit() {
  }

  /////////////////////////

  search() {
    this._http.get('assets/mock/search-result.json').subscribe(data => {
      this.initCore = false;
      const _chartConfig = chartOption;
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
