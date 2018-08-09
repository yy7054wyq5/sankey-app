import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService } from '../../services/common/common.service';
import { SearchResult, SearchStatus, SearchBarComponent } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable, of } from 'rxjs';
import { ChartNode, ChartEventCbParams } from '../../../share/components/chart/chart.service';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';

const searchPersonDetailApi = '/api/web/Detail/detail';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {
  constructor(private _common: CommonService, private _msg: NzMessageService, private _http: HttpClient) {}

  loadingId: any;
  option: any; // 图表配置项
  colorBar = chartColorConfig;
  initCore = true; // 初始状态
  person; // 侧栏任务信息

  @ViewChild('searchBar')
  searchBar: SearchBarComponent;

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
    const startPoint = this.searchBar.records.startAndEnd.start.id;
    const endPoint = this.searchBar.records.startAndEnd.end.id;
    let tag = '';
    nodes.forEach(node => {
      if (node.id) {
        if (node.id.indexOf('person') === 0) {
          if (node.id === startPoint || node.id === endPoint) {
            tag = 'point';
          } else {
            tag = 'person';
          }
        } else if (node.id.indexOf('case') === 0) {
          tag = 'case';
        } else if (node.id.indexOf('organization') === 0) {
          tag = 'organization';
        } else {
          // do something
        }
        this._setItemStyle(node, chartColorConfig[tag].bg, chartColorConfig[tag].hover);
      }
    });
    return of(nodes);
  }

  /**
   * loading效果
   *
   * @private
   * @returns {*}
   * @memberof CoreMainComponent
   */
  private _showLoading(): any {
    return this._msg.loading('请求数据中...', {
      nzDuration: 0
    }).messageId;
  }

  /**
   * 根据搜索状态展示loading
   *
   * @param {SearchStatus} status
   * @memberof CoreMainComponent
   */
  getSearchStatus(status: SearchStatus) {
    if (status === SearchStatus.pending) {
      this.loadingId = this._showLoading();
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
    if (!res.code && res.data && res.data.links.length && res.data.nodes.length) {
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
   * 图表事件
   *
   * @param {*} data
   * @memberof CoreMainComponent
   */
  mouseoverChartEvent(data) {
    console.log('over', data);
  }

  /**
   * 图表事件
   *
   * @param {*} data
   * @memberof CoreMainComponent
   */
  clickChartEvent(node) {
    // ChartEventCbParams
    if (node.dataType === 'node' && node.data.id.indexOf('person') === 0) {
      const loadingId = this._showLoading();
      this._http
        .get(searchPersonDetailApi, {
          params: {
            P_id: node.data.id
          }
        })
        .subscribe(
          (res: any) => {
            this._msg.remove(loadingId);
            if (!res.status && res.data) {
              this.person = res.data;
            } else {
              this.person = [];
            }
          },
          error => {
            this._msg.remove(loadingId);
          }
        );
    }
  }
}
