import { Injectable } from '@angular/core';

export interface ChartEventCbParams {
  // 当前点击的图形元素所属的组件名称，
  // 其值如 'series'、'markLine'、'markPoint'、'timeLine' 等。
  componentType: string;
  // 系列类型。值可能为：'line'、'bar'、'pie' 等。当 componentType 为 'series' 时有意义。
  seriesType: string;
  // 系列在传入的 option.series 中的 index。当 componentType 为 'series' 时有意义。
  seriesIndex: number;
  // 系列名称。当 componentType 为 'series' 时有意义。
  seriesName: string;
  // 数据名，类目名
  name: string;
  // 数据在传入的 data 数组中的 index
  dataIndex: number;
  // 传入的原始数据项
  data: ChartNode;
  // sankey、graph 等图表同时含有 nodeData 和 edgeData 两种 data，
  // dataType 的值会是 'node' 或者 'edge'，表示当前点击在 node 还是 edge 上。
  // 其他大部分图表中只有一种 data，dataType 无意义。
  dataType: string;
  // 传入的数据值
  value: number | any[];
  // 数据图形的颜色。当 componentType 为 'series' 时有意义。
  color: string;
}

export interface ChartNode {
  cases?: string[]; // 后端返回
  name: string;
  id: any;
  contact?: number; // 人脉
  line?: number; // 线路
  canHidden?: boolean; // 可隐藏标记
  date?: string;
  node?: any;
  value?: any;
  emphasis?: any; // 高亮样式
  itemStyle?: any; // 展示样式
  relation?: any;
  source?: string;
  target?: string;
}

export interface ChartLink {
  source: string;
  target: string;
  value: number;
  color?: string;
  relation?: string;
  lineStyle?: any;
  emphasis?: any;
  detail?:any;
  weight?:number;
  cases?:any;
  relationCaseName?:string;
  concat?:any;
}

@Injectable()
export class ChartService {
  constructor() {}
}
