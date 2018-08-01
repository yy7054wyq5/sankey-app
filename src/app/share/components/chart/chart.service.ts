import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface QueryLinksData {
  [id: string]: {
    tartget: any[];
    source: any[];
  };
}

export interface ChartNode {
  name: string;
  id: string;
  value?: any;
  emphasis?: any; // 高亮样式
  itemStyle?: any; // 展示样式
  dis?: string;
}

export interface ChartLink {
  source: string;
  target: string;
  value: string;
}

@Injectable()
export class ChartService {
  constructor() {}

  buildQueryLinksData(links: ChartLink[]): Observable<QueryLinksData> {
    const tmp: QueryLinksData = {};
    links.forEach(link => {
      // 以source为key存入tartget
      if (!tmp[link.source]) {
        tmp[link.source] = {
          tartget: [],
          source: []
        };
      }
      tmp[link.source].tartget.push(link.target);
      // 以target为key存入source
      if (!tmp[link.target]) {
        tmp[link.target] = {
          tartget: [],
          source: []
        };
      }
      tmp[link.target].source.push(link.source);
    });
    return of(tmp);
  }
}
