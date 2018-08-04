import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService } from '../../services/common/common.service';
import { SearchResult, SearchStatus } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable, of } from 'rxjs';
import { ChartNode } from '../../../share/components/chart/chart.service';

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

  /**
   * 加颜色的方法
   *
   * @private
   * @param {ChartNode} node
   * @param {string} normalColor
   * @param {string} highlightColor
   * @memberof CoreMainComponent
   */
  private _setItemStyle(node: ChartNode, normalColor: string, highlightColor: string) {
    node.itemStyle = {};
    node.itemStyle.color = node.itemStyle.borderColor = normalColor;
    node.emphasis = {};
    node.emphasis.itemStyle = {};
    node.emphasis.itemStyle.color = node.emphasis.itemStyle.borderColor = highlightColor;
  }

  /**
   * 设置节点背景色和高亮色
   *
   * @private
   * @param {ChartNode[]} nodes
   * @returns {Observable<ChartNode[]>}
   * @memberof CoreMainComponent
   */
  private _rebuildNodesData(nodes: ChartNode[]): Observable<ChartNode[]> {
    nodes.forEach(node => {
      if (node.id) {
        if (node.id.indexOf('person') === 0) {
          this._setItemStyle(node, chartColorConfig.person.bg, chartColorConfig.person.hover);
        }
        if (node.id.indexOf('case') === 0) {
          this._setItemStyle(node, chartColorConfig.case.bg, chartColorConfig.case.hover);
        }
        if (node.id.indexOf('organization') === 0) {
          this._setItemStyle(node, chartColorConfig.organization.bg, chartColorConfig.organization.hover);
        }
      }
    });
    return of(nodes);
  }

  /**
   * 根据搜索状态展示loading
   *
   * @param {SearchStatus} status
   * @memberof CoreMainComponent
   */
  getSearchStatus(status: SearchStatus) {
    if (status === SearchStatus.pending) {
      this.loadingId = this._msg.loading('请求数据中...', {
        nzDuration: 0
      }).messageId;
    } else {
      this._msg.remove(this.loadingId);
    }
  }

  /**
   * 获取关系数据
   *
   * @param {SearchResult} res
   * @memberof CoreMainComponent
   */
  getSearchResult(res: SearchResult) {
    console.log(res);
    this.initCore = false;
    if (!res.status && res.data) {
      const _chartConfig = chartOption;
      this._rebuildNodesData(res.data.nodes).subscribe(nodes => {
        _chartConfig.series[0].data = nodes;
        _chartConfig.series[0].links = res.data.links;
        this.option = Object.assign({}, _chartConfig);
        this._msg.remove(this.loadingId);
      });
    } else {
      this._msg.remove(this.loadingId);
      this.option = null;
    }
  }

  /**
   * 获取
   *
   * @param {*} data
   * @memberof CoreMainComponent
   */
  getSuccessRecords(data: any) {
    console.log('搜索成功的记录', data);
  }

  mouseoverChartEvent(data) {
    console.log('over', data);
  }
  clickChartEvent(data) {
    console.log('click', data);
  }
}
