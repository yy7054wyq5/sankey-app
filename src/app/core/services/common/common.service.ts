import { Injectable } from '@angular/core';
import { ChartNode, ChartLink } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { chartColorConfig } from '../../config';

export interface ObjTypeLinksData {
  [id: string]: {
    targets: string[];
    sources: string[];
  };
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
  private _setStyle(node: ChartNode, normalColor: string, highlightColor: string) {
    node.itemStyle = {};
    node.itemStyle.color = node.itemStyle.borderColor = normalColor;
    node.emphasis = {};
    node.emphasis.itemStyle = {};
    node.emphasis.itemStyle.color = node.emphasis.itemStyle.borderColor = highlightColor;
  }

  /**
   * 设置node节点的颜色和高亮
   *
   * @param {SearchBarComponent} searchBar
   * @param {ChartNode[]} nodes
   * @returns {Observable<ChartNode[]>}
   * @memberof CommonService
   */
  setNodesStyle(searchBar: SearchBarComponent, nodes: ChartNode[]): Observable<ChartNode[]> {
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
        this._setStyle(node, chartColorConfig[tag].bg, chartColorConfig[tag].hover);
      }
    });
    return of(nodes);
  }

  hasPusedInArr(item: string, arr: string[]) {
    return arr.indexOf(item) > -1;
  }

  /**
   * 将links重新组装以便展示
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

  getHiddenNodesInLine(ids: string[], objTypeLinksData: ObjTypeLinksData, data?: string[]): string[] {
    const hiddenNodesInLine = data || [];
    if (ids.length === 1) {
      if (!this.hasPusedInArr(ids[0], hiddenNodesInLine)) {
        hiddenNodesInLine.push(ids[0]);
      }
    }
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const targets = objTypeLinksData[id].targets;
      if (targets.length > 1) {
        for (let idx = 0; idx < targets.length; idx++) {
          const target = targets[idx];
          if (objTypeLinksData[target].sources.length === 1) {
            if (!this.hasPusedInArr(target, hiddenNodesInLine)) {
              hiddenNodesInLine.push(target);
            }
          }
        }
      }
      this.getHiddenNodesInLine(targets, objTypeLinksData, hiddenNodesInLine);
    }
    return hiddenNodesInLine;
  }
}
