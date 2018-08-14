import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService, ObjTypeLinksData } from '../../services/common/common.service';
import { SearchResult, SearchStatus, SearchBarComponent } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { ChartComponent } from '../../../share/components/chart/chart.component';
import { ChartNode, ChartLink } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { mergeMap } from '../../../../../node_modules/rxjs/operators';

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
  nodesHasCanHiddenAttr: ChartNode[] = []; // check-node组件所需节点数据
  links: ChartLink[] = [];
  private _nodesExchangeToObjUseIdkey: { [id: string]: ChartNode } = {};
  private _objTypeLinksData: ObjTypeLinksData;

  @ViewChild('searchBar')
  searchBar: SearchBarComponent;
  @ViewChild('chart')
  chart: ChartComponent;

  ngOnInit() {}

  /////////////////////////

  /**
   * 将数组转换为对象结构数据
   *
   * @private
   * @param {ChartNode[]} nodes
   * @returns {Observable<{ [id: string]: ChartNode }>}
   * @memberof CoreMainComponent
   */
  private _exchangeArrToObj(nodes: ChartNode[]): Observable<{ [id: string]: ChartNode }> {
    const tmp = {};
    nodes.forEach(node => {
      tmp[node.id] = node;
    });
    return of(tmp);
  }

  /**
   * 为可隐藏的点加标记并返回对象类links
   *
   * @private
   * @param {ChartLink[]} links
   * @param {ChartNode[]} nodes
   * @memberof CoreMainComponent
   */
  private _addCanHiddenAttrInNodeAndBackObjLinks(
    links: ChartLink[],
    nodes: ChartNode[]
  ): Observable<{ nodes: ChartNode[]; objLinks: ObjTypeLinksData }> {
    return this._common.buildLinksToObjByNodeId(links).pipe(
      mergeMap((_newLinks: ObjTypeLinksData) => {
        const startId = this.searchBar.records.startAndEnd.start.p_id;
        const startTargets = _newLinks[startId].targets;
        for (let idx = 0; idx < nodes.length; idx++) {
          const node = nodes[idx];
          const index = startTargets.indexOf(node.id);
          if (index > -1) {
            node.canHidden = true; // 添加可隐藏标记
            if (index === startTargets.length - 1) {
              return of({
                nodes: nodes,
                objLinks: _newLinks
              });
            }
          }
        }
      })
    );
  }

  /**
   * 从节点下拉框返回的已选中节点数据
   *
   * @param {ChartNode[]} activedNodes
   * @memberof ChartComponent
   */
  getCheckedNodes(data: { out: ChartNode[]; hidden: string[] }) {
    console.log('被隐藏的起点', data.hidden);
    const _loadingId = this._showLoading('图表重绘中....');
    const hiddenNodesId = this._common.getHiddenNodesInLine(data.hidden, this._objTypeLinksData);
    hiddenNodesId.pop(); // 删除终点
    const _newNodes = [];
    const _tmp = Object.assign({}, this._nodesExchangeToObjUseIdkey);
    console.log('被隐藏的一条线上的点', hiddenNodesId);
    hiddenNodesId.forEach(id => {
      delete _tmp[id];
    });
    for (const id in _tmp) {
      if (_tmp.hasOwnProperty(id)) {
        const node = _tmp[id];
        _newNodes.push(node);
      }
    }
    console.log(_newNodes);
    this._msg.remove(_loadingId);
    this._setChartOption(_newNodes, this.links);
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
  private _showLoading(msg = '请求数据中...'): any {
    return this._msg.loading(msg, {
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
        this.links = res.data.links;
        this._addCanHiddenAttrInNodeAndBackObjLinks(res.data.links, nodes).subscribe(data => {
          this._msg.remove(this.loadingId);
          this.nodesHasCanHiddenAttr = data.nodes;
          this._objTypeLinksData = data.objLinks;
          this._exchangeArrToObj(nodes).subscribe(_newNodes => (this._nodesExchangeToObjUseIdkey = _newNodes));
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
