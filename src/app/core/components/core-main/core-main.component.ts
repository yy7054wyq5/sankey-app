import { Component, OnInit, ViewEncapsulation, ViewChild, Renderer2, NgZone } from '@angular/core';
import { chartOption, chartColorConfig, caseColorConfig } from '../../config';
import { CommonService, ObjTypeLinksData, NodeCate } from '../../services/common/common.service';
import { Contacts, SearchStatus, SearchBarComponent, AjaxResponse, Line } from '../search-bar/search-bar.component';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { ChartComponent } from '../../../share/components/chart/chart.component';
import { ChartNode, ChartLink, ChartEventCbParams } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { mergeMap } from '../../../../../node_modules/rxjs/operators';
import { CheckTab } from '../check-node/check-node.component';

const searchPersonDetailApi = '/api/web/Detail/detailNew';
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
  encapsulation: ViewEncapsulation.None,
  providers: [CommonService]
})
export class CoreMainComponent implements OnInit {
  loadingId: any;
  option: any; // 图表配置项
  colorBar = chartColorConfig;
  colorCase = caseColorConfig;
  initCore = true; // 初始状态
  person = []; // 侧栏任务信息
  checknodesTab: CheckTab[] = []; // 显示隐藏起点的一度节点
  checkcontactsTab: CheckTab[] = []; // 显示隐藏人脉
  chartHeight = null;
  private _ajaxData: Contacts;
  private _chartFullStatus = false;

  nodeDataHasSourcesAndTargets: ObjTypeLinksData;

  siderIsFold = true; // 侧栏打开

  showChartFilterNodes = [];
  showChartFilterLinks = [];
  showChartLinesLength = 0;
  viewStatus = false;

  checkUIMode = checkUIMode.normal;

  checkUIPosition = {
    fullscreen: {
      contactsCheckUI: {
        // positionType: 'absolute',
        // top: 2.262626,
        // right: 20.525253,
        positionType: 'absolute',
        right: 20.525253,
        top: 1.262626,
        display: 'block',
        marginTop: '12px'
      },
      nodesCheckUI: {
        // positionType: 'absolute',
        // top: 2.262626,
        // right: 2.525253
        right: 2.525253,
        top: 1.262626,
        display: 'block',
        positionType: 'absolute',
        marginTop: '12px'
      }
    },
    normal: {
      contactsCheckUI: {
        // positionType: 'fixed',
        // top: 12.262626,
        // right: 25.525253,
        positionType: 'absolute',
        right: 25.525253,
        top: 1.262626,
        display: 'block',
        marginTop: '12px'
      },
      nodesCheckUI: {
        // positionType: 'fixed',
        // top: 12.262626,
        // right: 8.525253,
        right: 8.525253,
        top: 1.262626,
        display: 'block',
        positionType: 'absolute',
        marginTop: '12px'
      }
    }
  };

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

  constructor(
    private _common: CommonService,
    private _msg: NzMessageService,
    private _http: HttpClient,
    private _render: Renderer2,
    private _zone: NgZone
  ) {}

  ngOnInit() {}

  ////////////////////////////////////////////////////////////////////////////////////////////////////

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
        // console.log('节点对应关系', _newLinks);
        const startId = this.searchBar.records.startAndEnd.start.p_id;
        const startTargets = _newLinks[startId].targets;
        // console.log('起点目标点', startTargets);
        for (let idx = 0; idx < nodes.length; idx++) {
          const node = nodes[idx];
          const index = startTargets.indexOf(node.id);
          if (index > -1) {
            node.canHidden = true; // 添加可隐藏标记
          }
        }
        // console.log('nodes',nodes)
        // console.log('objLinks',_newLinks)
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
    this.showChartLinesLength = lines;
    this.changeClickView(this.viewStatus);
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
    let lines = 0;
    const startPoint = this.searchBar.records.startAndEnd.start.p_id; // 原节点
    for (const contact in record) {
      if (record.hasOwnProperty(contact)) {
        record[contact].forEach(lineIndex => {
          lines += 1;
          const newLineIndex = lineIndex;
          // const line: Line = this._ajaxData[contact][lineIndex];
          // nodes = [...nodes, ...line.nodes];
          // links = [...links, ...line.links];
          const contactRelationship = this._ajaxData[contact];
          // console.log('contactRelationship',contactRelationship);
          contactRelationship.forEach(element => {
            // 找到有相同id的关系数据
            if (
              this._common.getCommonId(element.nodes, newLineIndex) &&
              this._common.getCommonLinkId(element.links, newLineIndex, startPoint)
            ) {
              nodes = [...nodes, ...element.nodes];
              links = [...links, ...element.links];
            }
          });
        });
      }
    }
    console.log('node', nodes, 'links', links);
    this.showChartFilterNodes = this._common.filterNodes(nodes);
    this.showChartFilterLinks = this._common.filterLinks(links);
    this.showChartLinesLength = lines;
    this.changeClickView(this.viewStatus);
    // this._creatChart(this._common.filterNodes(nodes), this._common.filterLinks(links), lines);
    // const hasCaseObj = this._caseArrGetConcat(this._common.filterNodes(nodes),this._common.filterLinks(links));
    // console.log(hasCaseObj);
    // this._creatChart(hasCaseObj.newNodes, hasCaseObj.newLinks, lines);
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
  }

  /**
   * 获取关系数据
   *
   * @param {AjaxResponse} res
   * @memberof CoreMainComponent
   */
  getRealtions(res: AjaxResponse) {
    // console.log(res);
    this.initCore = false;
    if (!res.code && res.data && Object.keys(res.data).length) {
      this._ajaxData = res.data.relation;
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
      this.showChartLinesLength = this._ajaxData[Object.keys(this._ajaxData)[0]].length;
      this.changeClickView(this.viewStatus);

      // this._creatChart(nodesForDis, linksforDis, this._ajaxData[Object.keys(this._ajaxData)[0]].length);
      // this._creatChart(hasCaseObj.newNodes, hasCaseObj.newLinks, this._ajaxData[Object.keys(this._ajaxData)[0]].length);
    } else {
      this._msg.remove(this.loadingId);
      this.option = null;
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
  private _creatChart(nodes: ChartNode[], links: ChartLink[], lines: number) {
    // lines = getRandomIntInclusive(2, 30);
    // console.log(lines);
    if (lines > maxLines) {
      this.chartHeight = lines * 5 + 'rem';
    } else {
      this.chartHeight = null;
    }
    // 设置节点和线的样式
    this._common.setNodesAndLinksStyle(this.searchBar, nodes, links).subscribe(data => {
      // 生成图表
      this._setChartOption(data.nodes, data.links);
      this._msg.remove(this.loadingId);
    });
  }

  private changeClickView(isview: boolean) {
    this.viewStatus = isview;
    const filternodes = this.showChartFilterNodes.concat();
    const filterlinks = this.showChartFilterLinks.concat();
    if (isview) {
      const hasCaseObj = this._caseArrGetConcat(filternodes, filterlinks);
      this._creatChart(hasCaseObj.newNodes, hasCaseObj.newLinks, this.showChartLinesLength * 5);
      return;
    }
    this._creatChart(filternodes, filterlinks, this.showChartLinesLength);
  }

  /**
   *
   * @param nodes
   * @param links
   */
  private _caseArrGetConcat(nodes: ChartNode[], links: ChartLink[]) {
    const obj = {
      newNodes: [],
      newLinks: []
    };
    if (nodes && nodes.length !== 0) {
      obj.newNodes = nodes;
    }
    // 事件添加
    if (links && links.length !== 0) {
      links.forEach((item, index) => {
        if (!item.cases || item.cases.length === 0) {
          item.relationCaseName = '';
          obj.newLinks.push(item);
        } else {
          const linkEvery = item;
          const linkEveryIndx = index;
          console.log('linkEvery.source', linkEvery.source);
          const caseSource = linkEvery.source.replace(/person/g, 'case');
          const caseTarget = linkEvery.target.replace(/person/g, 'case');
          // console.log('linkEvery.source caseSource',linkEvery.source,caseSource);
          item.cases.forEach((caseItem, caseIndex) => {
            const caseEverySourceObj = {
              color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff',
              emphasis: {
                lineStyle: {
                  color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff'
                }
              },
              lineStyle: {
                color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff'
              },
              source: linkEvery.source,
              // target:('case' + linkEveryIndx + '-') + caseIndex,
              target: caseSource + caseTarget + caseItem,
              value: linkEvery.value / 5,
              relationCaseName: caseItem
            };
            const caseEveryTargetObj = {
              color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff',
              emphasis: {
                lineStyle: {
                  color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff'
                }
              },
              lineStyle: {
                color: this.colorCase[linkEvery.concat] ? this.colorCase[linkEvery.concat] : '#ffffff'
              },
              // source:('case' + linkEveryIndx + '-') + caseIndex,
              source: caseSource + caseTarget + caseItem,
              target: linkEvery.target,
              value: linkEvery.value / 5,
              relationCaseName: caseItem
            };
            const itemCaseIdObj = {
              // contact: 3
              // date: null
              // id: ('case' + linkEveryIndx + '-') + caseIndex,  //没有节点id都不同，但是可能事件相同
              id: caseSource + caseTarget + caseItem,
              // line: 0
              name: caseItem
            };
            obj.newLinks.push(caseEverySourceObj); // 原相同   不同target为事件id
            obj.newLinks.push(caseEveryTargetObj); // 不同source为事件id   相同target
            obj.newNodes.push(itemCaseIdObj); // 节点添加
            // let sourceHasNot = this.filterCommonLink(obj.newLinks,(('case' + linkEveryIndx + '-') + caseIndex),caseEverySourceObj,'source'); //判读是否有同源
            // let targetHasNot = this.filterCommonLink(obj.newLinks,(('case' + linkEveryIndx + '-') + caseIndex),caseEveryTargetObj,'target');//判断是否有同target
            // if (sourceHasNot) {
            //   if (targetHasNot) {
            //     //不加入到link和node数组  同源同target

            //   }else{
            //     //修改caseEveryTargetObj中的source  同源不同target   只加caseEveryTargetObj
            //     caseEveryTargetObj.source = sourceHasNot;
            //     obj.newLinks.push(caseEveryTargetObj);//不同source为事件id   相同target
            //    //obj.newNodes.push(itemCaseIdObj);//节点添加
            //   }
            // }else{
            //   if (targetHasNot) {
            //     //不同源同target,修改caseEverySourceObj中的target  只加caseEverySourceObj
            //     caseEverySourceObj.target = targetHasNot;
            //     obj.newLinks.push(caseEverySourceObj);//不同source为事件id   相同target
            //     // obj.newNodes.push(itemCaseIdObj);//节点添加
            //   }else{
            //     obj.newLinks.push(caseEverySourceObj);//原相同   不同target为事件id
            //     obj.newLinks.push(caseEveryTargetObj);//不同source为事件id   相同target
            //     obj.newNodes.push(itemCaseIdObj);//节点添加
            //   }
            // }
          });
        }
      });
    }
    const nodesDis = this._common.filterNodes(obj.newNodes); // 去重的nodes
    const linksDis = this._common.filterLinks(obj.newLinks);
    return {
      newNodes: nodesDis,
      newLinks: linksDis
    };
  }

  /**
   *
   * @param newlinks
   * @param caseId
   * @param linkobj
   * @param key
   */
  private filterCommonLink(newlinks, caseId, linkobj, key) {
    let status = '';
    for (let i of newlinks) {
      if (i[key] == linkobj[key] && i.relationCaseName == linkobj.relationCaseName) {
        if (key == 'source') {
          status = i.target;
        } else {
          status = i.source;
        }
        break;
      }
    }
    return status;
  }

  chartIsFull(isFull: boolean) {
    this._chartFullStatus = isFull;
    this.checkUIMode = isFull ? checkUIMode.fullscreen : checkUIMode.normal;
    this.siderIsFold = !isFull;
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
   * 显示人物信息
   *
   * @private
   * @param {ChartEventCbParams} node
   * @memberof CoreMainComponent
   */
  private _showPersonInfo(node: ChartEventCbParams): void {
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
    this._showPersonInfo(node);
  }
}
