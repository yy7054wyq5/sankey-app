import { Injectable } from '@angular/core';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { chartColorConfig } from '../../config';
import { mergeMap, single } from '../../../../../node_modules/rxjs/operators';

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

  private _hasPusedInArr(item: string, arr: string[]) {
    return arr.indexOf(item) > -1;
  }

  private _deleteIdInObjTypeLinksData(id: string, startId: string, olinks: ObjTypeLinksData, tag: string = 'source'): ObjTypeLinksData {
    let index: number;
    try {
      index = olinks[id][tag].indexOf(startId);
    } catch (error) {
      return olinks;
    }
    if (index > -1) {
      olinks[id][tag].splice(index, 1);
      if (!olinks[id][tag].length) {
        delete olinks[id][tag];
        if (!Object.keys(olinks[id]).length) {
          delete olinks[id];
        }
      }
    }
    if (tag === 'target') {
      return olinks;
    }
    return this._deleteIdInObjTypeLinksData(id, startId, olinks, 'target');
  }

  private _rebuildLinksStartToEnd(startId: string, olinks: ObjTypeLinksData, results?: ChartLink[]): ChartLink[] {
    const _tmp = results || [];
    const { targets, sources } = olinks[startId];
    const ids = [...targets, ...sources];
    if (!Object.keys(olinks).length) {
      return _tmp;
    }
    for (let idx = 0; idx < ids.length; idx++) {
      const id = ids[idx];
      _tmp.push({
        source: startId,
        target: id,
        value: 1
      });

      olinks = this._deleteIdInObjTypeLinksData(id, startId, olinks);
      console.log(olinks);

      // this._rebuildLinksStartToEnd(id, olinks, _tmp);
    }
    return _tmp;
  }

  rebuildLinks(start: string, end: string, links: ChartLink[]): Observable<ChartLink[]> {
    return this.buildLinksToObjByNodeId(links).pipe(
      mergeMap(_links => {
        console.log('111111', _links);
        const _new = this._rebuildLinksStartToEnd(start, _links);
        console.log('222222', _new);
        return of(_new);
      })
    );
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
      if (!this._hasPusedInArr(link.target, tmp[link.source].targets)) {
        tmp[link.source].targets.push(link.target);
      }
      // 以target为key存入source
      if (!tmp[link.target]) {
        tmp[link.target] = {
          targets: [],
          sources: []
        };
      }
      if (!this._hasPusedInArr(link.source, tmp[link.target].sources)) {
        tmp[link.target].sources.push(link.source);
      }
    });
    return of(tmp);
  }
}
