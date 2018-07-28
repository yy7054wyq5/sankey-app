import { Component, OnInit, Input, ElementRef, AfterViewInit, NgZone, Renderer2, ViewEncapsulation, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';
import theme from './theme';
import { ChartService } from './chart.service';

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
  @Input() eparent: string;
  @Input() eoption: any; // http://echarts.baidu.com/option.html

  detail: any;
  index: number;
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
      if (changes.eparent && !changes.eparent.isFirstChange()) {
        if (this.eparent) {

        }
        this._initChart();
      }
    }

  }

  ngOnInit() {
    this.index = this._chart.index;
    this.chartDom = this._element.nativeElement.querySelector('.chart');
  }

  ngAfterViewInit() {
    // 注册主题
    echarts.registerTheme('sn', theme);
    setTimeout(() => {
      this._initChart();
      this._chart.update();
      this._bindEvent();
    }, 1);

    this.unlistenDomParentResize = this._renderer.listen('window', 'resize', () => {
      this._initChart();
    });

  }

  ngOnDestroy() {
    this.chartInstance = null;
    this.eoption = null;
    this.unlistenDomParentResize();
  }

  /////////////////////////////////////////////////

  private _wraper(): HTMLElement {
    if (!this.eparent) {
      this.eparent = 'chart-parent-' + this.index;
    }
    console.log(this.eparent);
    return document.querySelector('.' + this.eparent);
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
    const _chartDom = this._setChartWH(this.chartDom, this.ewidth, this.eheight);
    // 将echart的初始化脱离NgZone的监控，以免造成大量的cpu占用
    // https://github.com/apache/incubator-echarts/issues/7047
    // http://www.ngfans.net/topic/24/post/2
    this._zone.runOutsideAngular(() => {
      this.chartInstance = this.chartInstance || echarts.init(_chartDom, 'sn');
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
   * @param {HTMLElement} chartDom
   * @param {string} width
   * @param {string} height
   * @returns {HTMLElement}
   * @memberof ChartComponent
   */
  private _setChartWH(chartDom: HTMLElement, width: string, height: string): HTMLElement {
    const wraper = this._wraper();
    console.log(wraper);
    width = width || chartDom.parentElement.clientWidth.toString() + 'px';
    height = height || chartDom.parentElement.clientHeight.toString() + 'px';
    this._renderer.setStyle(chartDom, 'width', width);
    this._renderer.setStyle(chartDom, 'height', height);
    return chartDom;
  }

}
