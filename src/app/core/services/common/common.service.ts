import { Injectable } from '@angular/core';
import { ChartNode, ChartLink, ChartEventCbParams } from '../../../share/components/chart/chart.service';
import { Observable, of, Observer } from '../../../../../node_modules/rxjs';
import { SearchBarComponent, Contacts, Line } from '../../components/search-bar/search-bar.component';
import { chartColorConfig, personDetailApi, companyDetailApi, eventHasPersonApi } from '../../config';
import { CheckOption } from '../../components/check-node/check-node.component';
import { objToArr } from '../../../share/utils';
import { CoreMainComponent } from '../../components/core-main/core-main.component';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';

/**
 * 为隐藏点准备的数据结构，由buildLinksToObjByNodeId函数生成
 *
 * @export
 * @interface ObjTypeLinksData
 */
export interface ObjTypeLinksData {
  [id: string]: {
    targets: string[];
    sources: string[];
  };
}

/**
 * 节点分类
 *
 * @enum {number}
 */
export enum NodeCate {
  person = 'person',
  case = 'case',
  middlePerson = 'middlePerson',
  organization = 'organization',
}

@Injectable()
export class CommonService {
  coreMainComponent: CoreMainComponent;

  constructor(private _http: HttpClient, private _msg: NzMessageService) {
    console.log('CommonService constructor');
  }

  /**
   * 过滤掉重复的node
   *
   * @param {ChartNode[]} nodes
   * @returns
   * @memberof CommonService
   */
  filterNodes(nodes: ChartNode[]): ChartNode[] {
    const nodesObj: { [id: string]: ChartNode } = {};
    nodes.forEach(node => {
      const _node: ChartNode = JSON.parse(JSON.stringify(node));
      delete _node.contact;
      delete _node.line;
      if (!nodesObj[node.id]) {
        nodesObj[node.id] = _node;
      }
    });
    return objToArr(nodesObj);
  }

  /**
   * 过滤掉重复的node
   *
   * @param {ChartNode[]} nodes
   * @returns
   * @memberof CommonService
   */
  filterNodesHasConAndLine(nodes: ChartNode[]): ChartNode[] {
    const nodesObj: { [id: string]: ChartNode } = {};
    nodes.forEach(node => {
      const _node: ChartNode = JSON.parse(JSON.stringify(node));
      if (!nodesObj[node.id]) {
        nodesObj[node.id] = _node;
      }
    });
    return objToArr(nodesObj);
  }

  /**
   * 过滤掉重复的links
   *
   * @param {ChartLink[]} links
   * @returns
   * @memberof CommonService
   */
  filterLinks(links: ChartLink[]): ChartLink[] {
    const _linksObj: { [id: string]: ChartLink } = {};
    links.forEach(link => {
      const _link: ChartLink = JSON.parse(JSON.stringify(link));
      const id = `s_${link.source}_t_${link.target}`;
      if (!_linksObj[id]) {
        _linksObj[id] = _link;
      }
    });
    // console.log(_linksObj);
    return objToArr(_linksObj);
  }

  /**
   * 获取人脉下的需要的links，只传总数据则只返回第一个人脉的数据
   *
   * @param {Contacts} data
   * @param {number} [contact]
   * @param {number[]} [lines]
   * @returns {ChartLink[]}
   * @memberof CommonService
   */
  outCrtContactLinks(data: Contacts, contact?: number, lines?: number[]): ChartLink[] {
    let links = [];
    const crtContactLine: Line[] = data[contact || Object.keys(data)[0]];
    if (lines) {
      lines.forEach(lineIndex => {
        links = [...links, ...crtContactLine[lineIndex].links];
      });
    } else {
      crtContactLine.forEach(line => {
        links = [...links, ...line.links];
      });
    }
    return links;
  }

  /**
   * 返回人脉下所需nodes
   *
   * @param {Contacts} data
   * @param {number} [contact]
   * @param {number[]} [lines]
   * @returns {ChartNode[]}
   * @memberof CommonService
   */
  outCrtContactNodes(data: Contacts, contact?: number, lines?: number[]): ChartNode[] {
    let nodes = [];
    const crtContactLine: Line[] = data[contact || Object.keys(data)[0]];
    if (lines) {
      lines.forEach(lineIndex => {
        nodes = [...nodes, ...crtContactLine[lineIndex].nodes];
      });
    } else {
      crtContactLine.forEach(line => {
        nodes = [...nodes, ...line.nodes];
      });
    }
    return nodes;
  }

  // 寻找nodes中相同id的
  getCommonId(data: ChartNode[], needShowNodeId: string) {
    for (let index = 0; index < data.length; index++) {
      const chartNode = data[index];
      if (chartNode.id === needShowNodeId) {
        return true;
      }
    }
  }
  // 寻找links中相同id的
  getCommonLinkId(data: ChartLink[], needShowNodeId: string, startPoint: string) {
    for (let index = 0; index < data.length; index++) {
      const chartLink = data[index];
      if (chartLink.target === needShowNodeId && chartLink.source === startPoint) {
        return true;
      }
    }
  }

  /**
   * 加颜色的方法
   *
   * @private
   * @param {ChartNode} node
   * @param {string} normalColor
   * @param {string} highlightColor
   * @memberof CoreMainComponent
   */
  setNodeStyle(node: ChartNode, normalColor: string, highlightColor: string) {
    node.itemStyle = {};
    node.itemStyle.color = node.itemStyle.borderColor = normalColor;
    node.emphasis = {};
    node.emphasis.itemStyle = {};
    node.emphasis.itemStyle.color = node.emphasis.itemStyle.borderColor = highlightColor;
  }

  setLinkStyle(link: ChartLink, normalColor: string, highlightColor: string) {
    link.lineStyle = {};
    link.lineStyle.color = normalColor;
    link.emphasis = {};
    link.emphasis.lineStyle = {};
    link.emphasis.lineStyle.color = highlightColor;
  }

  /**
   * 创建下拉数据
   *
   * @private
   * @param {ChartNode[]} data
   * @returns {Observable<UInodes>}
   * @memberof CheckNodeComponent
   */
  separateNode(data: ChartNode[], searchBar: SearchBarComponent): Observable<{ [tag: string]: CheckOption[] | undefined }> {
    const tmp = {};
    const startPoint = searchBar.isOnePointMode ? searchBar.onePoint : searchBar.start;
    const endPoint = searchBar.isOnePointMode ? null : searchBar.end;
    data.forEach(node => {
      const _node: CheckOption = {
        ...node,
        actived: true
      };
      if (_node.id) {
        if (node.id.indexOf(NodeCate.middlePerson) > -1) {
          this._newObjArr(tmp, NodeCate.middlePerson).push(_node);
        } else if (node.id.indexOf(NodeCate.organization) > -1 || node.id.indexOf('org') > -1) {
          this._newObjArr(tmp, NodeCate.organization).push(_node);
        } else if (node.id.indexOf(NodeCate.person) > -1 && (startPoint === node.id || endPoint === node.id)) {
          // 属于person,是源和目标
          this._newObjArr(tmp, NodeCate.person).push(_node);
        } else if (node.id.indexOf(NodeCate.person) > -1 && startPoint !== node.id && endPoint !== node.id) {
          // 属于person,但不是源和目标
          this._newObjArr(tmp, NodeCate.middlePerson).push(_node);
        }
      }
    });
    return of(tmp);
  }

  /**
   * 创建类型为数组的对象属性
   *
   * @private
   * @param {Object} obj
   * @param {string} tag
   * @returns
   * @memberof CommonService
   */
  private _newObjArr(obj: Object, tag: string) {
    if (!obj[tag]) {
      obj[tag] = [];
    }
    return obj[tag];
  }

  /**
   * 设置node节点的颜色和高亮
   *
   * @param {SearchBarComponent} searchBar
   * @param {ChartNode[]} nodes
   * @returns {Observable<ChartNode[]>}
   * @memberof CommonService
   */
  setNodesAndLinksStyle(
    searchBar: SearchBarComponent,
    nodes: ChartNode[],
    links: ChartLink[]
  ): Observable<{ nodes: ChartNode[]; links: ChartLink[] }> {
    const startPoint = searchBar.isOnePointMode ? searchBar.onePoint : searchBar.start;
    const endPoint = searchBar.isOnePointMode ? null : searchBar.end;
    let tag = '';
    nodes.forEach(node => {
      if (node.id) {
        if (node.id.indexOf('person') === 0) {
          if (node.id === startPoint || node.id === endPoint) {
            tag = 'point';
          } else {
            tag = 'person';
          }
        } else if (node.id.indexOf('middlePerson') === 0) {
          tag = 'organization';
        } else if (node.id.indexOf('case') === 0) {
          tag = 'case';
        } else {
          // do something
        }
        this.setNodeStyle(node, chartColorConfig[tag].bg, chartColorConfig[tag].hover);
      }
    });
    links.forEach(link => {
      this.setLinkStyle(link, link.color, link.color);
    });
    return of({ nodes, links });
  }

  /**
   * 是否已推进数组中
   *
   * @param {string} item
   * @param {string[]} arr
   * @returns {boolean}
   * @memberof CommonService
   */
  hasPusedInArr(item: string, arr: string[]): boolean {
    return arr.indexOf(item) > -1;
  }

  /**
   * 将links重新组装以便展示；隐藏点操作的前置数据准备函数
   *
   * @param {ChartLink[]} links
   * @returns {Observable<ObjTypeLinksData>}
   * @memberof ChartService
   */
  buildLinksToObjByNodeId(links: ChartLink[]): Observable<ObjTypeLinksData> {
    const tmp: ObjTypeLinksData = {};
    links.forEach(link => {
      // 以source为key存入tartget
      if (!tmp[link.source]) {
        tmp[link.source] = {
          targets: [],
          sources: []
        };
      }
      if (!this.hasPusedInArr(link.target, tmp[link.source].targets)) {
        tmp[link.source].targets.push(link.target);
      }
      // 以target为key存入source
      if (!tmp[link.target]) {
        tmp[link.target] = {
          targets: [],
          sources: []
        };
      }
      if (!this.hasPusedInArr(link.source, tmp[link.target].sources)) {
        tmp[link.target].sources.push(link.source);
      }
    });
    return of(tmp);
  }

  /**
   * loading效果
   *
   * @private
   * @returns {*}
   * @memberof CoreMainComponent
   */
  showLoading(msg = '请求数据中...'): any {
    return this._msg.loading(msg, {
      nzDuration: 0
    }).messageId;
  }

  /**
   * 显示信息
   *
   * @private
   * @param {ChartEventCbParams} node
   * @memberof CoreMainComponent
   */
  requestNodeInfo(node: ChartEventCbParams | string): Observable<any> {
    console.log(node);
    return Observable.create((ob: Observer<any>) => {
      // 点击图表事件
      if (typeof node !== 'string' && node.dataType === 'edge') {
        ob.next({
          node: node,
          type: 'case'
        });
        ob.complete();
        return;
      }

      let searchNodeDetailApi = '';
      const id = typeof node === 'string' ? node : node.data.id;
      let type = '';

      if (id.indexOf('person') > -1) {
        searchNodeDetailApi = personDetailApi;
        type = 'person';
      } else if (id.indexOf('organization') > -1 || id.indexOf('org') > -1) {
        searchNodeDetailApi = companyDetailApi;
        type = 'organization';
      } else {
        searchNodeDetailApi = eventHasPersonApi;
        type = 'case';
      }

      const loadingId = this.showLoading();
      this._http
        .get(searchNodeDetailApi, {
          params: {
            id: id
          }
        })
        .subscribe(
          (res: any) => {
            this._msg.remove(loadingId);
            if (!res.status && res.data) {
              ob.next({
                res: res.data,
                node: node,
                type: type,
                id: id
              });
              ob.complete();
            } else {
              ob.next(null);
              ob.complete();
            }
          },
          error => {
            this._msg.remove(loadingId);
            ob.next(null);
            ob.complete();
          }
        );
    });
  }

  /**
   * 获取隐藏点对应的一条线上的点
   *
   * @param {string[]} ids
   * @param {ObjTypeLinksData} objTypeLinksData
   * @param {string[]} [data]
   * @returns {string[]}
   * @memberof CommonService
   */
  // getHiddenNodesInLine(ids: string[], objTypeLinksData: ObjTypeLinksData, data?: string[]): string[] {
  //   const hiddenNodesInLine = data || [];
  //   for (let index = 0; index < ids.length; index++) {
  //     const id = ids[index];
  //     const targets = objTypeLinksData[id].targets; // 该点的所有目标点
  //     if (targets.length > 1) {
  //       for (let idx = 0; idx < targets.length; idx++) {
  //         const target = targets[idx];
  //         // 若目标点只对应了一个源点
  //         if (objTypeLinksData[target].sources.length === 1) {
  //           if (!this.hasPusedInArr(target, hiddenNodesInLine)) {
  //             hiddenNodesInLine.push(target);
  //           }
  //         }
  //       }
  //     } else {
  //       // 若该点只有一个目标点
  //       if (!this.hasPusedInArr(id, hiddenNodesInLine)) {
  //         hiddenNodesInLine.push(id);
  //       }
  //     }
  //     this.getHiddenNodesInLine(targets, objTypeLinksData, hiddenNodesInLine);
  //   }
  //   return hiddenNodesInLine;
  // }
}
