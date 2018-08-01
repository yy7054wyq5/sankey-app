import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService } from '../../services/common/common.service';
import { SearchResult } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {
  constructor(private _common: CommonService) {}

  option: any; // 图表配置项
  colorBar = chartColorConfig;
  initCore = true; // 初始状态

  ngOnInit() {}

  /////////////////////////

  getSearchResult(res: SearchResult) {
    this.initCore = false;
    if (!res.status) {
      const _chartConfig = chartOption;
      _chartConfig.series[0].data = res.data.nodes;
      _chartConfig.series[0].links = res.data.links;
      this.option = _chartConfig;
    }
  }

  mouseoverChartEvent(data) {
    console.log('over', data);
  }
  clickChartEvent(data) {
    console.log('click', data);
  }
}
