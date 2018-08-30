import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { chartOption, chartColorConfig } from '../../config';
import { CommonService, ObjTypeLinksData, NodeCate } from '../../services/common/common.service';
import { Contacts, SearchStatus, SearchBarComponent, AjaxResponse, Line } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { ChartComponent } from '../../../share/components/chart/chart.component';
import { ChartNode, ChartLink } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { mergeMap } from '../../../../../node_modules/rxjs/operators';
import { CheckTab } from '../check-node/check-node.component';

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
  // nodes: ChartNode[];
  // links: { [key: number]: ChartLink[] };
  // crtNodes: ChartNode[] = [];
  // crtlinks: ChartLink[] = [];
  checknodesTab: CheckTab[] = []; // 显示隐藏起点的一度节点
  checkcontactsTab: CheckTab[] = []; // 显示隐藏人脉
  private _ajaxData: Contacts;
  // private _nodesExchangeToObjUseIdkey: { [id: string]: ChartNode } = {};
  // private _objTypeLinksData: ObjTypeLinksData;

  /**
   * 是否显示人脉或节点下拉框
   *
   * @readonly
   * @memberof CoreMainComponent
   */
  get showCheckComponent() {
    return this._ajaxData;
  }

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
        console.log('节点对应关系', _newLinks);
        const startId = this.searchBar.records.startAndEnd.start.p_id;
        const startTargets = _newLinks[startId].targets;
        console.log('起点目标点', startTargets);
        for (let idx = 0; idx < nodes.length; idx++) {
          const node = nodes[idx];
          const index = startTargets.indexOf(node.id);
          if (index > -1) {
            node.canHidden = true; // 添加可隐藏标记
          }
        }
        return of({
          nodes: nodes,
          objLinks: _newLinks
        });
      })
    );
  }

  /**
   * 选择人脉
   *
   * @param {{ out: number[]; hidden: number[] }} data
   * @memberof CoreMainComponent
   */
  getCheckedContacts(data: { out: number[]; hidden: number[] }) {
    console.log(data);
    let links = [];
    let nodes = [];
    if (data.out.length) {
      // 遍历已选人脉
      data.out.forEach(contact => {
        links = links.concat(this._common.outCrtContactLinks(this._ajaxData, contact));
        nodes = nodes.concat(this._common.outCrtContactNodes(this._ajaxData, contact));
      });
    }
    const contactsAllNodes = nodes;
    const filterNodes = this._common.filterNodes(contactsAllNodes);
    const filterLinks = this._common.filterLinks(links);
    console.log(filterLinks);
    this._creatNodesCheckTab(contactsAllNodes, filterLinks);
    this._afterGetData(filterNodes, filterLinks);
  }

  /**
   * 选择节点
   *
   * @param {ChartNode[]} activedNodes
   * @memberof ChartComponent
   */
  getCheckedNodes(data: { out: ChartNode[]; hidden: ChartNode[] }) {
    console.log('选的节点', data);
    const record = {};
    data.out.forEach(chartNode => {
      if (!record[chartNode.contact]) {
        record[chartNode.contact] = [];
      }
      record[chartNode.contact].push(chartNode.line);
    });
    // 目前只对起点后面的做显隐，所以一个点就代表了一条线，所以可以直接根据返回的显示点来显示图表
    let nodes = [];
    let links = [];
    for (const contact in record) {
      if (record.hasOwnProperty(contact)) {
        record[contact].forEach(lineIndex => {
          const line: Line = this._ajaxData[contact][lineIndex];
          nodes = [...nodes, ...line.nodes];
          links = [...links, ...line.links];
        });
      }
    }
    console.log(nodes, links);
    this._afterGetData(this._common.filterNodes(nodes), this._common.filterLinks(links));
    // const _loadingId = this._showLoading('图表重绘中....');
    // const hiddenNodesId = this._common.getHiddenNodesInLine(data.hidden, this._objTypeLinksData);
    // hiddenNodesId.pop(); // 删除终点
    // const _newNodes = [];
    // const _tmp = Object.assign({}, this._nodesExchangeToObjUseIdkey);
    // console.log('被隐藏的一条线上的点', hiddenNodesId);
    // hiddenNodesId.forEach(id => {
    //   delete _tmp[id];
    // });
    // for (const id in _tmp) {
    //   if (_tmp.hasOwnProperty(id)) {
    //     const node = _tmp[id];
    //     _newNodes.push(node);
    //   }
    // }
    // console.log(_newNodes);
    // this._msg.remove(_loadingId);
    // this._setChartOption(_newNodes, this.crtlinks);
  }

  /**
   * 生成人脉下拉
   *
   * @private
   * @param {{ [key: number]: ChartLink[] }} links
   * @returns {CheckTab[]}
   * @memberof CoreMainComponent
   */
  private _creatContactsCheckTab(data: Contacts): CheckTab[] {
    const tab = new CheckTab('contacts', '人脉', 'grey');
    const firstContact = Object.keys(data)[0];
    Object.keys(data).forEach(contact => {
      tab.options.push({
        canHidden: true,
        name: contact + '度',
        id: parseInt(contact, 10),
        actived: contact === firstContact ? true : false
      });
    });
    return [tab];
  }

  /**
   * 创建节点下拉数据
   *
   * @private
   * @param {{ links: ChartLink[]; nodes: ChartNode[] }} data
   * @memberof CoreMainComponent
   */
  private _creatNodesCheckTab(nodes: ChartNode[], links: ChartLink[]) {
    if (links.length) {
      // 初始化节点下拉框
      this.checknodesTab = [];
      this.checknodesTab[0] = new CheckTab('organization', '公司', 'blue');
      this.checknodesTab[1] = new CheckTab('case', '事件', 'orange');
      this._addCanHiddenAttrInNodeAndBackObjLinks(links, nodes).subscribe(_data => {
        // 分离可以显隐的数据
        this._common.separateNode(_data.nodes).subscribe(cheknodes => {
          this.checknodesTab.forEach((tab, idx) => {
            if (tab.tag === NodeCate.case) {
              this.checknodesTab[idx].options = cheknodes[NodeCate.case] || [];
            } else if (tab.tag === NodeCate.organization) {
              this.checknodesTab[idx].options = cheknodes[NodeCate.organization] || [];
            }
          });
        });
        console.log(this.checknodesTab);
        // 隐藏单个节点，为隐藏整条线的准备数据
        // this._objTypeLinksData = _data.objLinks;
        // this._exchangeArrToObj(data.nodes).subscribe(_newNodes => (this._nodesExchangeToObjUseIdkey = _newNodes));
      });
    } else {
      this.checknodesTab = [];
    }
  }

  /**
   * 获取关系数据
   *
   * @param {Contacts} res
   * @memberof CoreMainComponent
   */
  getContacts(res: AjaxResponse) {
    console.log(res);
    this.initCore = false;
    if (!res.code && res.data && Object.keys(res.data).length) {
      this._ajaxData = res.data;
      this.checkcontactsTab = this._creatContactsCheckTab(this._ajaxData);
      // 默认显示已有的第一度人脉
      const linksforDis = this._common.filterLinks(this._common.outCrtContactLinks(this._ajaxData)); // 去重的links
      const crtAllNodes = this._common.outCrtContactNodes(this._ajaxData); // 未去重的所有的nodes
      const nodesForDis = this._common.filterNodes(crtAllNodes); // 去重的nodes
      this._creatNodesCheckTab(crtAllNodes, linksforDis);
      this._afterGetData(nodesForDis, linksforDis);
    } else {
      this._msg.remove(this.loadingId);
      this.option = null;
    }
  }

  /**
   * 当前人脉数据
   *
   * @private
   * @memberof CoreMainComponent
   */
  private _afterGetData(nodes: ChartNode[], links: ChartLink[]) {
    // 设置节点和线的样式
    this._common.setNodesAndLinksStyle(this.searchBar, nodes, links).subscribe(data => {
      // 生成图表
      this._setChartOption(data.nodes, data.links);
      this._msg.remove(this.loadingId);
    });
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
   * 图表事件
   *
   * @param {*} data
   * @memberof CoreMainComponent
   */
  mouseoverChartEvent(data) {
    // console.log('over', data);
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
