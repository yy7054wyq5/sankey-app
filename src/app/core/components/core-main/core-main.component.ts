import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { chartOption, chartColorConfig, caseColorConfig, nodesAndLinksInOneLineColor } from '../../config';
import { CommonService, ObjTypeLinksData, NodeCate } from '../../services/common/common.service';
import { Contacts, SearchStatus, SearchBarComponent, AjaxResponse, noResultDis } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { ChartComponent } from '../../../share/components/chart/chart.component';
import { ChartNode, ChartLink, ChartEventCbParams } from '../../../share/components/chart/chart.service';
import { Observable, of, Subject } from 'rxjs';
import { mergeMap } from '../../../../../node_modules/rxjs/operators';
import { CheckTab } from '../check-node/check-node.component';

const maxLines = 10;

/**
 * 图表下拉框定位模式
 *
 * @enum {number}
 */
enum checkUIMode {
  normal = 'normal',
  fullscreen = 'fullscreen'
}

@Component({
  selector: 'app-core-main',
  templateUrl: './core-main.component.html',
  styleUrls: ['./core-main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CoreMainComponent implements OnInit {
  loadingId: any;
  option: any; // 图表配置项
  colorCase = caseColorConfig;
  initCore = true; // 初始状态
  checknodesTab: CheckTab[] = []; // 显示隐藏起点的一度节点
  checkcontactsTab: CheckTab[] = []; // 显示隐藏人脉
  private _ajaxData: Contacts;
  private _LinksToObjByNodeId: ObjTypeLinksData;
  chartFullStatus = false;
  nodeDetailData; // 点的详情数据
  fullDetailData; // 完整的详情数据
  allNodes: { [peronId: string]: any } = {}; // 所有节点，用于在事件卡片中显示事件的起点和终点

  /**
   * 供订阅
   *
   * @memberof CoreMainComponent
   */
  checkNodesTabSubject = new Subject<CheckTab[]>();

  totalPages = 5;
  crtPageIndex = 1;

  nodeDataHasSourcesAndTargets: ObjTypeLinksData;

  hideSearchBar = false; // 侧栏打开

  showChartFilterNodes = [];
  showChartFilterLinks = [];

  checkUIMode = checkUIMode.normal;

  noResultDis = noResultDis;

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

  constructor(private _common: CommonService, private _msg: NzMessageService, private _http: HttpClient) {
    this._common.coreMainComponent = this;
  }

  ngOnInit() {}

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  UI_viewFullDetail(info) {
    // console.log(info);
    this._common.requestNodeInfo(info.id).subscribe(res => {
      console.log(info, res);
      this.fullDetailData = { ...res, name: info.name };
    });
  }

  /**
   * 页码变化
   *
   * @param {*} pageIndex
   * @memberof CoreMainComponent
   */
  UI_pageIndexChange(pageIndex) {
    console.log(pageIndex);
    this.crtPageIndex = pageIndex;
    // 调用搜索
    this.searchBar.search(null, true);
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
        this._LinksToObjByNodeId = _newLinks;
        // console.log('节点对应关系', _newLinks);
        const startId = this.searchBar.isOnePointMode ? this.searchBar.onePoint : this.searchBar.start;
        console.log(startId);
        let startTargets = _newLinks[startId].targets;
        if (this.searchBar.isOnePointMode) {
          let startTargetsTargets = [];
          for (let index = 0; index < startTargets.length; index++) {
            // 起点目标的目标，即二度节点
            const item = startTargets[index];
            startTargetsTargets = [...startTargetsTargets, ..._newLinks[item].targets];
          }
          startTargets = startTargetsTargets;
          // console.log(startTargets);
        } else {
          startTargets = _newLinks[startId].targets;
        }
        // console.log('起点目标点', startTargets);
        for (let idx = 0; idx < nodes.length; idx++) {
          const node = nodes[idx];
          const index = startTargets.indexOf(node.id);
          if (index > -1) {
            node.canHidden = true; // 添加可隐藏标记
          }
        }
        console.log('nodes', nodes);
        // console.log('objLinks',_newLinks);
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
    // console.log(data);
    let links = [];
    let nodes = [];
    let lines = 0;
    if (data.out.length) {
      // 遍历已选人脉
      data.out.forEach(contact => {
        lines += this._ajaxData[contact].length;
        links = links.concat(this._common.outCrtContactLinks(this._ajaxData, contact));
        nodes = nodes.concat(this._common.outCrtContactNodes(this._ajaxData, contact));
      });
    }
    const contactsAllNodes = nodes;
    const filterNodes = this._common.filterNodes(contactsAllNodes);
    const filterLinks = this._common.filterLinks(links);
    const filterNodesHasLine = this._common.filterNodesHasConAndLine(contactsAllNodes); // 去重nodes后不删除其中的contact和line
    console.log(filterLinks);
    // this._creatNodesCheckTab(contactsAllNodes, filterLinks);
    this._creatNodesCheckTab(filterNodesHasLine, filterLinks); // nodes`去重不删除其中的contact和line   传入
    // this._creatChart(filterNodes, filterLinks, lines);
    // const hasCaseObj = this._caseArrGetConcat(filterNodes,filterLinks);
    // console.log(hasCaseObj);
    this.showChartFilterNodes = filterNodes;
    this.showChartFilterLinks = filterLinks;
    this.renderChart();
    // this._creatChart(filterNodes, filterLinks, lines);
  }

  /**
   * 选中的节点
   *
   * @param {{ out: ChartNode[]; hidden: ChartNode[] }} data
   * @memberof CoreMainComponent
   */
  getCheckedNodes(data: { out: ChartNode[]; hidden: ChartNode[] }) {
    console.log('选的节点', data);
    const record = {};
    data.out.forEach(chartNode => {
      if (!record[chartNode.contact]) {
        record[chartNode.contact] = [];
      }
      record[chartNode.contact].push(chartNode.id);
    });
    // 目前只对起点后面的做显隐，所以一个点就代表了一条线，所以可以直接根据返回的显示点来显示图表
    let nodes = [];
    let links = [];
    let startPoints: string[]; // 原节点

    if (this.searchBar.isOnePointMode) {
      const _ = this.searchBar.onePoint;
      if (this._LinksToObjByNodeId) {
        startPoints = this._LinksToObjByNodeId[_].targets; // 将1度节点作为起点
      } else {
        startPoints = [_];
      }
    } else {
      startPoints = [this.searchBar.start];
    }

    startPoints.forEach(point => {
      for (const contact in record) {
        if (record.hasOwnProperty(contact)) {
          record[contact].forEach(needShowNodeId => {
            const lines = this._ajaxData[contact];
            lines.forEach(line => {
              // 找到有相同id的关系数据
              if (this._common.getCommonId(line.nodes, needShowNodeId) && this._common.getCommonLinkId(line.links, needShowNodeId, point)) {
                nodes = [...nodes, ...line.nodes];
                links = [...links, ...line.links];
              }
            });
          });
        }
      }
    });

    console.log('node', nodes, 'links', links);
    this.showChartFilterNodes = this._common.filterNodes(nodes);
    this.showChartFilterLinks = this._common.filterLinks(links);
    this.renderChart();
  }

  /**
   * 创建人脉下拉
   *
   * @private
   * @param {Contacts} data
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
   * @param {ChartNode[]} nodes
   * @param {ChartLink[]} links
   * @memberof CoreMainComponent
   */
  private _creatNodesCheckTab(nodes: ChartNode[], links: ChartLink[]) {
    if (links.length) {
      // 初始化节点下拉框
      this.checknodesTab = [];
      this.checknodesTab[0] = new CheckTab('middlePerson', '路径筛选', 'orange');
      // this.checknodesTab[1] = new CheckTab('case', '事件', 'orange');
      this._addCanHiddenAttrInNodeAndBackObjLinks(links, nodes).subscribe(_data => {
        this.nodeDataHasSourcesAndTargets = _data.objLinks;

        // 分离可以显隐的数据
        this._common.separateNode(_data.nodes, this.searchBar).subscribe(cheknodes => {
          this.checknodesTab.forEach((tab, idx) => {
            if (tab.tag === NodeCate.middlePerson) {
              this.checknodesTab[idx].options = cheknodes[NodeCate.middlePerson] || [];
            } else if (tab.tag === NodeCate.organization) {
              this.checknodesTab[idx].options = cheknodes[NodeCate.organization] || [];
            }
          });
        });
        console.log(this.checknodesTab);
      });
    } else {
      this.checknodesTab = [];
    }

    setTimeout(() => {
      this.checkNodesTabSubject.next(this.checknodesTab);
    }, 1);
  }

  /**
   * 获取关系数据
   *
   * @param {AjaxResponse} res
   * @memberof CoreMainComponent
   */
  getRealtions(res: AjaxResponse) {
    console.log(res);

    if (!res.code) {
      this.initCore = false;
    }

    if (!res.code && res.data && Object.keys(res.data).length) {
      this.totalPages = res.pages;
      this._ajaxData = res.data.relation;
      this.allNodes = {};

      const colors = nodesAndLinksInOneLineColor;

      for (const contact in this._ajaxData) {
        if (this._ajaxData.hasOwnProperty(contact)) {
          const crtContact = this._ajaxData[contact];
          for (let index = 0; index < crtContact.length; index++) {
            const line = crtContact[index];

            line.nodes.forEach(node => {
              this.allNodes[node.id] = node;
              if (index / colors.length < 1) {
                this._common.setNodeStyle(node, colors[index], colors[index]);
              } else {
                const _ = (index / colors.length).toString();
                if (_.indexOf('.') > -1) {
                  const idx = parseFloat(`0.${_.split('.')[1]}`) * colors.length;
                  this._common.setNodeStyle(node, colors[idx], colors[idx]);
                } else {
                  this._common.setNodeStyle(node, colors[0], colors[0]);
                }
              }
            });

            line.links.forEach(_link => {
              if (index / colors.length < 1) {
                this._common.setLinkStyle(_link, colors[index], colors[index]);
              } else {
                const _ = (index / colors.length).toString();
                if (_.indexOf('.') > -1) {
                  const idx = parseFloat(`0.${_.split('.')[1]}`) * colors.length;
                  this._common.setLinkStyle(_link, colors[idx], colors[idx]);
                } else {
                  this._common.setLinkStyle(_link, colors[0], colors[0]);
                }
              }
            });
          }
        }
      }

      console.log(this._ajaxData);
      console.log(this.allNodes);

      // this._common.setNodeStyle();
      // this._common.setLinkStyle()

      this.checkcontactsTab = this._creatContactsCheckTab(this._ajaxData);
      // 默认显示已有的第一度人脉
      const linksforDis = this._common.filterLinks(this._common.outCrtContactLinks(this._ajaxData)); // 去重的links
      const crtAllNodes = this._common.outCrtContactNodes(this._ajaxData); // 未去重的所有的nodes
      const nodesForDis = this._common.filterNodes(crtAllNodes); // 去重的nodes
      const nodesHasLine = this._common.filterNodesHasConAndLine(crtAllNodes); // 去重nodes后不删除其中的contact和line
      // this._creatNodesCheckTab(crtAllNodes, linksforDis);
      // console.log(nodesHasLine,linksforDis);
      this._creatNodesCheckTab(nodesHasLine, linksforDis); // nodes去重但不删除contact和line,  传入
      // 改变去重后的links数组，将case提取出来，并加上source和target    改变去重的nodes,将case的id加上
      // const hasCaseObj = this._caseArrGetConcat(nodesForDis,linksforDis);
      // console.log(hasCaseObj);
      this.showChartFilterNodes = nodesForDis;
      this.showChartFilterLinks = linksforDis;
      this.renderChart();

      // this._creatChart(nodesForDis, linksforDis, this._ajaxData[Object.keys(this._ajaxData)[0]].length);
      // this._creatChart(hasCaseObj.newNodes, hasCaseObj.newLinks, this._ajaxData[Object.keys(this._ajaxData)[0]].length);
    } else {
      this._msg.remove(this.loadingId);
      this.option = null;
      this._LinksToObjByNodeId = null;
      this._ajaxData = {};
    }
  }

  /**
   * 生成图表
   *
   * @private
   * @param {ChartNode[]} nodes
   * @param {ChartLink[]} links
   * @memberof CoreMainComponent
   */
  private _creatChart(nodes: ChartNode[], links: ChartLink[]) {
    // 起点终点加颜色
    let findStartEndPoint = 0;
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (this.searchBar.isOnePointMode) {
        if (node.id === this.searchBar.onePoint) {
          findStartEndPoint += 1;
          this._common.setNodeStyle(node, chartColorConfig.point.bg, chartColorConfig.point.bg);
          console.log(node);
        }
      } else {
        if (node.id === this.searchBar.start || node.id === this.searchBar.end) {
          findStartEndPoint += 1;
          this._common.setNodeStyle(node, chartColorConfig.point.bg, chartColorConfig.point.bg);
          console.log(node);
        }
      }
      if (findStartEndPoint === 2) {
        break;
      }
    }

    this._setChartOption(nodes, links);
    this._msg.remove(this.loadingId);
  }

  UI_clickFolder(bool) {
    this.hideSearchBar = !this.hideSearchBar;
    if (this.chart) {
      this.chart.mustResize();
    }
  }

  private renderChart() {
    const filternodes = this.showChartFilterNodes.concat();
    const filterlinks = this.showChartFilterLinks.concat();
    this._creatChart(filternodes, filterlinks);
  }

  chartIsFull(isFull: boolean) {
    this.chartFullStatus = isFull;
    this.checkUIMode = isFull ? checkUIMode.fullscreen : checkUIMode.normal;
    this.hideSearchBar = isFull;
  }

  /**
   * 根据搜索状态展示loading
   *
   * @param {SearchStatus} status
   * @memberof CoreMainComponent
   */
  getSearchStatus(status: SearchStatus) {
    if (status === SearchStatus.pending) {
      this.loadingId = this._common.showLoading();
    }
  }

  /**
   * 侧栏展开状态
   *
   * @param {*} bool
   * @memberof CoreMainComponent
   */
  siderFoldStatus(isFold) {
    setTimeout(() => {
      if (this.chart) {
        this.chart.mustResize();
      }
    }, 400);
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
    // console.log(nodes);
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
  clickChartEvent(data: { crtNode: ChartEventCbParams; chartInstance: any }) {
    // ChartEventCbParams
    const node = data.crtNode;
    const chart = data.chartInstance;
    this._common.requestNodeInfo(node).subscribe(nodeDetailData => {
      this.nodeDetailData = nodeDetailData;
    });
  }
}
