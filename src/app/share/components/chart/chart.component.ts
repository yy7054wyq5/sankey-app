import { Component, OnInit, Input, ElementRef, AfterViewInit, NgZone, Renderer2, ViewEncapsulation, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as echarts from 'echarts';
import theme from './theme';
import { ChartService } from './chart.service';

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
  data: Object;
  // sankey、graph 等图表同时含有 nodeData 和 edgeData 两种 data，
  // dataType 的值会是 'node' 或者 'edge'，表示当前点击在 node 还是 edge 上。
  // 其他大部分图表中只有一种 data，dataType 无意义。
  dataType: string;
  // 传入的数据值
  value: number | any[];
  // 数据图形的颜色。当 componentType 为 'series' 时有意义。
  color: string;
}


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() ehasFullBtn = true;
  @Input() ewidth: string;
  @Input() eheight: string;
  @Input() eloading: boolean;
  @Input() efullParentClassName: string;
  @Input() eoption: any; // http://echarts.baidu.com/option.html
  @Output() emouseover = new EventEmitter<any>();
  @Output() eclick = new EventEmitter<any>();

  detail: any;
  hadFull = 'no';
  chartDom: HTMLElement;
  chartInstance: any;
  unlistenDomParentResize: any;

  constructor(
    private _chart: ChartService,
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _zone: NgZone
  ) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.eoption && !changes.eoption.isFirstChange()) {
        this._initChart();
      }
    }
  }

  ngOnInit() {
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
      this._initChart();
    });

  }

  ngOnDestroy() {
    this._destroyChart();
    this.eoption = null;
    this.unlistenDomParentResize();
  }

  /////////////////////////////////////////////////


  /**
   * 全屏切换
   *
   * @param {string} tag
   * @memberof ChartComponent
   */
  public toFull(tag: string) {
    this.hadFull = tag;
    // 重写寻找父级的方法
    if (tag === 'no') {
      this._wraper = () => {
        return this.chartDom.parentElement;
      };
    } else {
      this._wraper = () => {
        return document.querySelector('.' + this.efullParentClassName);
      };
    }
    this._initChart();
  }


  /**
   * 返回图表父级
   *
   * @private
   * @memberof ChartComponent
   */
  private _wraper = (): HTMLElement => {
    return this.chartDom.parentElement;
  }


  /**
   * 销毁图表
   *
   * @private
   * @memberof ChartComponent
   */
  private _destroyChart() {
    if (this.chartInstance) {
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
    if (!this.chartDom && !this.eoption) {
      return;
    }
    this._destroyChart();
    const _chartDom = this._setChartWH(this.chartDom, this.ewidth, this.eheight);
    this._zone.runOutsideAngular(() => {
      this.chartInstance = echarts.init(_chartDom, 'sn');
      this.chartInstance.setOption(this.eoption);
      this.eloading = false;
    });
    this._bindEvent();
  }


  /**
   * 绑定事件
   *
   * @private
   * @memberof ChartComponent
   */
  private _bindEvent() {
    if (this.chartInstance) {
      this.chartInstance.on('click', (params: ChartEventCbParams) => {
        this.eclick.emit(params);
      });

      this.chartInstance.on('mouseover', (params: ChartEventCbParams) => {
        this.emouseover.emit(params);
      });
    }
  }


  /**
   * 设置宽高
   *
   * @private
   * @param {HTMLElement} chartDom
   * @param {string} width
   * @param {string} height
   * @returns {HTMLElement}
   * @memberof ChartComponent
   */
  private _setChartWH(chartDom: HTMLElement, width: string, height: string): HTMLElement {
    const wraper = this._wraper();
    width = width || wraper.clientWidth.toString() + 'px';
    height = height || wraper.clientHeight.toString() + 'px';
    this._renderer.setStyle(chartDom, 'width', width);
    this._renderer.setStyle(chartDom, 'height', height);
    return chartDom;
  }

}
