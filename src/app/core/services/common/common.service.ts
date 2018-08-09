import { Injectable } from '@angular/core';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { chartColorConfig } from '../../config';

export interface QueryLinksData {
  [id: string]: {
    tartgets: string[];
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

  rebuildLinks(searchBar: SearchBarComponent, links: ChartLink[]): ChartLink[] {
    const start = searchBar.records.startAndEnd.start.p_id;
    const end = searchBar.records.startAndEnd.end.p_id;
    const _tmp = [];

    this.buildLinksToObjByNodeId(links).subscribe(_links => {
      const startSource = _links[start].sources;
      const startTargets = _links[start].tartgets;
    });
    links.forEach(link => {});
    return [];
  }

  /**
   * 将links重新组装以便展示
   *
   * @param {ChartLink[]} links
   * @returns {Observable<QueryLinksData>}
   * @memberof ChartService
   */
  buildLinksToObjByNodeId(links: ChartLink[]): Observable<QueryLinksData> {
    const tmp: QueryLinksData = {};
    links.forEach(link => {
      // 以source为key存入tartget
      if (!tmp[link.source]) {
        tmp[link.source] = {
          tartgets: [],
          sources: []
        };
      }
      tmp[link.source].tartgets.push(link.target);
      // 以target为key存入source
      if (!tmp[link.target]) {
        tmp[link.target] = {
          tartgets: [],
          sources: []
        };
      }
      tmp[link.target].sources.push(link.source);
    });
    return of(tmp);
  }
}
