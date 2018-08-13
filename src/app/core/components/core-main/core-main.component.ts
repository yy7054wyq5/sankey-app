import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService, ObjTypeLinksData } from '../../services/common/common.service';
import { SearchResult, SearchStatus, SearchBarComponent } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { ChartComponent } from '../../../share/components/chart/chart.component';
import { ChartNode, ChartLink } from '../../../share/components/chart/chart.service';

const searchPersonDetailApi = '/api/web/Detail/detail';

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [CommonService]
})
export class CoreMainComponent implements OnInit {
  constructor(private _common: CommonService, private _msg: NzMessageService, private _http: HttpClient) {}

  loadingId: any;
  option: any; // 图表配置项
  colorBar = chartColorConfig;
  initCore = true; // 初始状态
  person = []; // 侧栏任务信息
  nodes: ChartNode[] = [];
  links: ChartLink[] = [];

  @ViewChild('searchBar')
  searchBar: SearchBarComponent;
  @ViewChild('chart')
  chart: ChartComponent;

  ngOnInit() {}

  /////////////////////////

  /**
   * 获取可隐藏的点
   *
   * @private
   * @param {ChartLink[]} links
   * @param {ChartNode[]} nodes
   * @memberof CoreMainComponent
   */
  private _buildCanHiddenNodes(links: ChartLink[], nodes: ChartNode[], cb: Function) {
    this._common.buildLinksToObjByNodeId(links).subscribe((_newLinks: ObjTypeLinksData) => {
      const startId = this.searchBar.records.startAndEnd.start.p_id;
      const startTargets = _newLinks[startId].targets;
      for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx];
        const index = startTargets.indexOf(node.id);
        if (index > -1) {
          node.canHidden = true; // 添加可隐藏标记
          if (index === startTargets.length - 1) {
            cb();
            return;
          }
        }
      }
    });
  }

  /**
   * 从节点下拉框返回的已选中节点数据
   *
   * @param {ChartNode[]} activedNodes
   * @memberof ChartComponent
   */
  getCheckedNodes(notHiddenNodes: ChartNode[]) {
    this._setChartOption(notHiddenNodes, this.links);
  }

  /**
   * 侧栏展开状态
   *
   * @param {*} bool
   * @memberof CoreMainComponent
   */
  siderFoldStatus(isFold) {
    if (this.chart) {
      this.chart.mustResize();
    }
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
   * 配置图表
   *
   * @private
   * @param {ChartNode[]} nodes
   * @param {ChartLink[]} links
   * @memberof CoreMainComponent
   */
  private _setChartOption(nodes: ChartNode[], links: ChartLink[]) {
    const _chartConfig = chartOption;
    _chartConfig.series[0].data = nodes;
    _chartConfig.series[0].links = links;
    this.option = Object.assign({}, _chartConfig);
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
    }
  }

  /**
   * 获取关系数据
   *
   * @param {SearchResult} res
   * @memberof CoreMainComponent
   */
  getSearchResult(res: SearchResult) {
    // console.log(res);
    this.initCore = false;
    if (!res.code && res.data && res.data.links.length && res.data.nodes.length) {
      this._common.setNodesStyle(this.searchBar, res.data.nodes).subscribe(nodes => {
        this._setChartOption(nodes, res.data.links);
        this.nodes = nodes;
        this.links = res.data.links;
        this._buildCanHiddenNodes(res.data.links, nodes, () => {
          this._msg.remove(this.loadingId);
        });
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
