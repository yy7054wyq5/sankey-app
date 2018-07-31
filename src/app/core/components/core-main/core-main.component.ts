import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService } from '../../services/common/common.service';

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

  ngOnInit() {
    // 订阅搜索
    this._common.search$.subscribe(data => {
      this.initCore = false;
      const _chartConfig = chartOption;
      _chartConfig.series[0].data = data[0].nodes;
      _chartConfig.series[0].links = data[0].links;
      this.option = _chartConfig;
    });
  }

  /////////////////////////

  mouseoverChartEvent(data) {
    console.log('over', data);
  }
  clickChartEvent(data) {
    console.log('click', data);
  }
}
