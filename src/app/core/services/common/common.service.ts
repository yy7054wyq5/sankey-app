import { Injectable } from '@angular/core';
import { ChartNode, ChartLink } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { chartColorConfig } from '../../config';
import { CheckOption } from '../../components/check-node/check-node.component';

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
  organization = 'organization'
}

@Injectable()
export class CommonService {
  constructor() {}

  /**
   * 加颜色的方法
   *
   * @private
   * @param {ChartNode} node
   * @param {string} normalColor
   * @param {string} highlightColor
   * @memberof CoreMainComponent
   */
  private _setNodeStyle(node: ChartNode, normalColor: string, highlightColor: string) {
    node.itemStyle = {};
    node.itemStyle.color = node.itemStyle.borderColor = normalColor;
    node.emphasis = {};
    node.emphasis.itemStyle = {};
    node.emphasis.itemStyle.color = node.emphasis.itemStyle.borderColor = highlightColor;
  }

  private _setLinkStyle(link: ChartLink, normalColor: string, highlightColor: string) {
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
  separateNode(data: ChartNode[]): Observable<{ [tag: string]: CheckOption[] }> {
    const tmp = {};
    data.forEach(node => {
      const _node: CheckOption = {
        ...node,
        actived: true
      };
      if (_node.id) {
        if (node.id.indexOf(NodeCate.case) > -1) {
          this._newObjArr(tmp, NodeCate.case).push(_node);
        } else if (node.id.indexOf(NodeCate.organization) > -1) {
          this._newObjArr(tmp, NodeCate.organization).push(_node);
        } else if (node.id.indexOf(NodeCate.person) > -1) {
          this._newObjArr(tmp, NodeCate.person).push(_node);
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
    const startPoint = searchBar.records.startAndEnd.start.p_id;
    const endPoint = searchBar.records.startAndEnd.end.p_id;
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
        this._setNodeStyle(node, chartColorConfig[tag].bg, chartColorConfig[tag].hover);
      }
    });
    links.forEach(link => {
      this._setLinkStyle(link, link.color, link.color);
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
   * 获取隐藏点对应的一条线上的点
   *
   * @param {string[]} ids
   * @param {ObjTypeLinksData} objTypeLinksData
   * @param {string[]} [data]
   * @returns {string[]}
   * @memberof CommonService
   */
  getHiddenNodesInLine(ids: string[], objTypeLinksData: ObjTypeLinksData, data?: string[]): string[] {
    const hiddenNodesInLine = data || [];
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const targets = objTypeLinksData[id].targets; // 该点的所有目标点
      if (targets.length > 1) {
        for (let idx = 0; idx < targets.length; idx++) {
          const target = targets[idx];
          // 若目标点只对应了一个源点
          if (objTypeLinksData[target].sources.length === 1) {
            if (!this.hasPusedInArr(target, hiddenNodesInLine)) {
              hiddenNodesInLine.push(target);
            }
          }
        }
      } else {
        // 若该点只有一个目标点
        if (!this.hasPusedInArr(id, hiddenNodesInLine)) {
          hiddenNodesInLine.push(id);
        }
      }
      this.getHiddenNodesInLine(targets, objTypeLinksData, hiddenNodesInLine);
    }
    return hiddenNodesInLine;
  }
}
