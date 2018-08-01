import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService } from '../../services/common/common.service';
import {
  SearchResult,
  SearchStatus,
  ChartNode
} from '../search-bar/search-bar.component';
import { NzMessageService } from '../../../../../node_modules/ng-zorro-antd';
import { Observable, of } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {
  constructor(private _common: CommonService, private _msg: NzMessageService) {}

  loadingId: any;
  option: any; // 图表配置项
  colorBar = chartColorConfig;
  initCore = true; // 初始状态

  ngOnInit() {}

  /////////////////////////

  private _setItemStyle(
    node: ChartNode,
    normalColor: string,
    highlightColor: string
  ) {
    node.itemStyle = {};
    node.itemStyle.color = node.itemStyle.borderColor = normalColor;
    node.emphasis = {};
    node.emphasis.itemStyle = {};
    node.emphasis.itemStyle.color = node.emphasis.itemStyle.borderColor = highlightColor;
  }

  private _rebuildNodesData(nodes: ChartNode[]): Observable<ChartNode[]> {
    nodes.forEach(node => {
      if (node.id) {
        if (node.id.indexOf('person') === 0) {
          this._setItemStyle(
            node,
            chartColorConfig.person.bg,
            chartColorConfig.person.hover
          );
        }
        if (node.id.indexOf('case') === 0) {
          this._setItemStyle(
            node,
            chartColorConfig.case.bg,
            chartColorConfig.case.hover
          );
        }
        if (node.id.indexOf('organization') === 0) {
          this._setItemStyle(
            node,
            chartColorConfig.organization.bg,
            chartColorConfig.organization.hover
          );
        }
      }
    });
    return of(nodes);
  }

  getSearchStatus(status: SearchStatus) {
    if (status === SearchStatus.pending) {
      this.loadingId = this._msg.loading('请求数据中...', {
        nzDuration: 0
      }).messageId;
    }
  }

  getSearchResult(res: SearchResult) {
    console.log(res);
    this.initCore = false;
    if (!res.status && res.data) {
      const _chartConfig = chartOption;
      this._rebuildNodesData(res.data.nodes).subscribe(nodes => {
        _chartConfig.series[0].data = nodes;
        _chartConfig.series[0].links = res.data.links;
        console.log(_chartConfig);
        this.option = _chartConfig;
        this._msg.remove(this.loadingId);
      });
    } else {
      this._msg.remove(this.loadingId);
      this.option = null;
    }
  }

  mouseoverChartEvent(data) {
    console.log('over', data);
  }
  clickChartEvent(data) {
    console.log('click', data);
  }
}
