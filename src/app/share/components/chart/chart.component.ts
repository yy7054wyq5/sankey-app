import { Component, OnInit, Input, ElementRef, AfterViewInit, NgZone, Renderer2, ViewEncapsulation, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';
import theme from './theme';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() ewidth: string;
  @Input() eheight: string;
  @Input() eloading: boolean;
  @Input() eoption: any; // http://echarts.baidu.com/option.html

  detail: any;
  chartDom: HTMLElement;
  chartInstance: any;

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2, // 实验性功能
    private _zone: NgZone
  ) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.eoption && !changes.eoption.isFirstChange()) {
      this._initChart();
    }
  }

  ngOnInit() {
    this.chartDom = this._element.nativeElement.querySelector('.chart');
  }

  ngAfterViewInit() {
    // 注册主题
    echarts.registerTheme('ascm', theme);
    setTimeout(() => {
      this._initChart();
      this._bindEvent();
    }, 1);
    window.onresize = () => {
      this._initChart();
    };
  }

  ngOnDestroy() {
    this.chartInstance = null;
    this.eoption = null;
  }

  /////////////////////////////////////////////////

  /**
   * 初始化图表
   *
   * @private
   * @memberof ChartComponent
   */
  private _initChart() {
    if (!this.eheight) {
      console.error('[eheight]必须设定有一个值，比如[eheight]=“‘400px’”');
      return;
    }
    if (!this.chartDom) {
      return;
    }
    const _dom = this._setStyle(this.chartDom, this.ewidth, this.eheight);
    // 将echart的初始化脱离NgZone的监控，以免造成大量的cpu占用
    // https://github.com/apache/incubator-echarts/issues/7047
    // http://www.ngfans.net/topic/24/post/2
    this._zone.runOutsideAngular(() => {
      this.chartInstance = this.chartInstance || echarts.init(_dom, 'ascm');
      this.chartInstance.setOption(this.eoption);
      this.eloading = false;
    });
  }


  /**
   * 绑定事件
   *
   * @private
   * @memberof ChartComponent
   */
  private _bindEvent() {
    if (this.chartInstance) {
      this.chartInstance.on('click', (param) => {
        this._zone.run(() => {
          this.detail = param.name;
        });
      });
    }
  }


  /**
   * 设置宽高
   *
   * @private
   * @param {HTMLElement} dom
   * @param {string} width
   * @param {string} height
   * @returns {HTMLElement}
   * @memberof ChartComponent
   */
  private _setStyle(dom: HTMLElement, width: string, height: string): HTMLElement {
    const wraper = dom.parentElement.parentElement.parentElement;
    width = width || dom.clientWidth.toString() + 'px';
    this._renderer.setStyle(dom, 'width', width);
    this._renderer.setStyle(dom, 'height', height || 'auto');
    return dom;
  }

}
