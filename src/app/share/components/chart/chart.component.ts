import {
  Component,
  OnInit,
  Input,
  ElementRef,
  AfterViewInit,
  NgZone,
  Renderer2,
  ViewEncapsulation,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import * as echarts from 'echarts';
import theme from './theme';
import { ChartService, QueryLinksData, ChartNode, ChartOption } from './chart.service';

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
  data: {
    id: any;
    name: string;
    node?: any;
    date?: string;
  };
  // sankey、graph 等图表同时含有 nodeData 和 edgeData 两种 data，
  // dataType 的值会是 'node' 或者 'edge'，表示当前点击在 node 还是 edge 上。
  // 其他大部分图表中只有一种 data，dataType 无意义。
  dataType: string;
  // 传入的数据值
  value: number | any[];
  // 数据图形的颜色。当 componentType 为 'series' 时有意义。
  color: string;
}

enum FullStatus {
  yes = 'yes',
  no = 'no'
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [ChartService]
})
export class ChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() ehasFullBtn = true;
  @Input() ewidth: string;
  @Input() eheight: string;
  @Input() eloading: boolean;
  @Input() efullParentClassName: string;
  @Input() echeckPoints = true;
  @Input() eoption: ChartOption; // http://echarts.baidu.com/option.html
  @Output() efullStatus = new EventEmitter<boolean>();
  @Output() emouseover = new EventEmitter<any>();
  @Output() eclick = new EventEmitter<any>();

  selectOpenStatus = false;
  // 鼠标经过或点击的文字
  UI_nodeDetail = {
    show: false,
    date: '',
    txt: ''
  };
  fullStatus = FullStatus.no; // yes为全屏
  chartDom: Element; // 图表结构
  chartContainer: Element; // 整个组件
  chartInstance: any; // 图表实例
  bindedEvent: boolean; // 是否已绑定事件
  unlistenDomParentResize: any; // 监听窗口大小变化事件
  clickedNode: ChartEventCbParams;
  nodes: ChartNode[] = [];

  /**
   * 用于点击节点高亮连线
   *
   * @type {QueryLinksData}
   * @memberof ChartComponent
   */
  // relation: QueryLinksData;

  get chartActived() {
    // 图表是否激活
    return this.chartInstance ? true : false;
  }

  constructor(private _chart: ChartService, private _element: ElementRef, private _renderer: Renderer2, private _zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.eoption && !changes.eoption.isFirstChange()) {
        if (!this.chartInstance) {
          this._initChart();
        } else {
          this.chartInstance.setOption(this.eoption);
        }
      }
    }
  }

  ngOnInit() {
    this.chartContainer = this._element.nativeElement;
    this.chartDom = this._element.nativeElement.querySelector('.chart');
  }

  ngAfterViewInit() {
    // 注册主题
    echarts.registerTheme('sn', theme);
    setTimeout(() => {
      this._initChart();
    }, 1);

    // 监听窗口变化
    this.unlistenDomParentResize = this._renderer.listen('window', 'resize', () => {
      this._resizeChart();
    });
  }

  ngOnDestroy() {
    this._destroyChart();
    this.eoption = null;
    this.clickedNode = null;
    this.unlistenDomParentResize();
  }

  /////////////////////////////////////////////////

  getCheckedNodes(activedNodes: ChartNode[]) {
    this.eoption.series[0].data = activedNodes;
    console.log(this.eoption);
    this.chartInstance.setOption(this.eoption);
  }

  /**
   * 设置样式
   *
   * @private
   * @param {Element} dom
   * @param {({ [styleKey: string]: string | number })} params
   * @memberof ChartComponent
   */
  private _setStyle(dom: Element, params: { [styleKey: string]: string | number }) {
    for (const styleKey in params) {
      if (params.hasOwnProperty(styleKey)) {
        let styleValue = params[styleKey];
        styleValue = typeof styleValue === 'number' ? styleValue.toString() + 'px' : styleValue;
        this._renderer.setStyle(dom, styleKey, styleValue);
      }
    }
  }

  /**
   * 手动设置全屏模式下底部的高度
   *
   * @private
   * @param {*} bool
   * @memberof ChartComponent
   */
  private _showPointInfo(bool) {
    const hackClassName = 'full-hack';
    const hackDIV = document.querySelector(`.${hackClassName}`) || document.createElement('div');
    this._setStyle(hackDIV, { height: bool ? '9.090909rem' : '0' });
    if (hackDIV.className.indexOf(hackClassName) < 0) {
      hackDIV.className = hackClassName;
      this.chartContainer.appendChild(hackDIV);
    }
  }

  /**
   * 全屏切换
   *
   * @param {string} tag
   * @memberof ChartComponent
   */
  public toFull(tag: string) {
    this.fullStatus = FullStatus[tag];
    this._resizeChart();
  }

  /**
   * 改变全屏样式
   *
   * @private
   * @memberof ChartComponent
   */
  private _exchangeContainerStyle() {
    if (this.fullStatus === 'yes') {
      const wraper = document.querySelector('.' + this.efullParentClassName);
      const left = wraper['offsetLeft'];
      const top = wraper['offsetTop'];
      const width = wraper.clientWidth;
      const height = wraper.clientHeight;
      // this._showPointInfo(true);
      this.efullStatus.emit(true);
      this._setStyle(this.chartContainer, {
        position: 'fixed',
        left,
        top,
        width,
        height
      });
    } else {
      // this._showPointInfo(true);
      this.efullStatus.emit(false);
      this._setStyle(this.chartContainer, {
        position: 'relative',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      });
    }
  }

  /**
   * 重绘
   *
   * @private
   * @returns
   * @memberof ChartComponent
   */
  private _resizeChart() {
    if (this.ewidth || this.eheight) {
      return;
    }
    this._exchangeContainerStyle();
    this._zone.runOutsideAngular(() => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    });
  }

  /**
   * 销毁图表
   *
   * @private
   * @memberof ChartComponent
   */
  private _destroyChart() {
    if (this.chartInstance) {
      this.clickedNode = null;
      this.chartInstance.dispose();
      this._setChartWH(this.chartDom, '0px', '0px');
    }
  }

  /**
   * 初始化图表
   *
   * @private
   * @memberof ChartComponent
   */
  private _initChart() {
    if (!this.chartDom || !this.eoption) {
      return;
    }
    this.clickedNode = null;
    const _chartDom = this._setChartWH(this.chartDom, this.ewidth, this.eheight);
    this._zone.runOutsideAngular(() => {
      this.chartInstance = echarts.init(_chartDom, 'sn');
      this.chartInstance.setOption(this.eoption);
      // 显隐数据
      this.nodes = this.eoption.series[0].data;
      this.eloading = false;
    });
    if (!this.bindedEvent) {
      this._bindEvent();
      this.bindedEvent = true;
    }
    // this._chart
    //   .buildQueryLinksData(this.eoption.series[0].links)
    //   .subscribe(links => {
    //     this.relation = links;
    //     console.log(links);
    //   });
  }

  /**
   * 高亮节点并返回点击的节点数据
   *
   * @private
   * @param {ChartEventCbParams} params
   * @memberof ChartComponent
   */
  private _highlightNode(params: ChartEventCbParams) {
    if (this.clickedNode) {
      this.chartInstance.dispatchAction({
        type: 'downplay',
        dataIndex: this.clickedNode.dataIndex
      });
    }
    this.chartInstance.dispatchAction({
      type: 'highlight',
      dataIndex: params.dataIndex
    });
    this.clickedNode = params;
  }

  /**
   * 点击后是否显示点的
   *
   * @private
   * @param {string} id
   * @returns {boolean}
   * @memberof ChartComponent
   */
  private _showClickedNodeInfo(id: string): boolean {
    if (id.indexOf('case') === 0) {
      return true;
    }
    return false;
  }

  /**
   * 绑定事件
   *
   * @private
   * @memberof ChartComponent
   */
  private _bindEvent() {
    this.chartInstance.on('click', (params: ChartEventCbParams) => {
      // console.log(params);
      if (params.dataType !== 'node') {
        return;
      }
      this.eclick.emit(params);
      this._highlightNode(params);
      // 显示点击文字
      this._zone.run(() => {
        this.UI_nodeDetail = {
          show: this._showClickedNodeInfo(params.data.id),
          date: params.data.date,
          txt: params.data.name
        };
      });
    });
    this.chartInstance.on('mouseover', (params: ChartEventCbParams) => {
      // this.emouseover.emit(params);
      // this._zone.run(() => {
      //   this.UI_nodeDetail = 'MOUSEOVER' + JSON.stringify(params.data);
      // });
    });
  }

  /**
   * 设置宽高
   *
   * @private
   * @param {Element} chartDom
   * @param {string} width
   * @param {string} height
   * @returns {Element}
   * @memberof ChartComponent
   */
  private _setChartWH(chartDom: Element, width: string, height: string): Element {
    if (width && height) {
      this._setStyle(chartDom, { width, height });
    }
    return chartDom;
  }
}
