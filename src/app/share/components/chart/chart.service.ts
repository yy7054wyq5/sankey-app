import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ChartOption {
  label: {
    formatter: Function
  };
  series: [{
    type: string,
    layout: string,
    data: ChartNode[],
    links: ChartLink[],
    lineStyle: {
      color: string,
      opacity: number
    },
    emphasis: {
      lineStyle: {
        color: string,
        opacity: number
      }
    }
  }];
}

export interface QueryLinksData {
  [id: string]: {
    tartgets: string[];
    sources: string[];
  };
}

export interface ChartNode {
  name: string;
  id: any;
  date?: string;
  node: any;
  actived?: boolean; // 用于选中
  value?: any;
  emphasis?: any; // 高亮样式
  itemStyle?: any; // 展示样式
}

export interface ChartLink {
  source: string;
  target: string;
  value: string;
}

@Injectable()
export class ChartService {
  constructor() { }

  /**
   * 将links重新组装以便查找路线
   *
   * @param {ChartLink[]} links
   * @returns {Observable<QueryLinksData>}
   * @memberof ChartService
   */
  buildQueryLinksData(links: ChartLink[]): Observable<QueryLinksData> {
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
