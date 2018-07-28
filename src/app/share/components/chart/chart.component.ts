import { Component, OnInit, Input, ElementRef, AfterViewInit, NgZone, Renderer2, ViewEncapsulation, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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

  @Input() ehasFullBtn = true;
  @Input() ewidth: string;
  @Input() eheight: string;
  @Input() eloading: boolean;
  @Input() efullParentClassName: string;
  @Input() eoption: any; // http://echarts.baidu.com/option.html
  @Output() emouseenter = new EventEmitter<any>();
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
      this._chart.update();
      this._bindEvent();
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
  }


  /**
   * 绑定事件
   *
   * @private
   * @memberof ChartComponent
   */
  private _bindEvent() {
    if (this.chartInstance) {
      this.chartInstance.on('click', (params) => {
        this._zone.run(() => {
          this.eclick.emit(params);
        });
      });

      this.chartInstance.on('mouseenter', (params) => {
        this._zone.run(() => {
          this.eclick.emit(params);
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
    width = width || wraper.clientWidth.toString() + 'px';
    height = height || wraper.clientHeight.toString() + 'px';
    this._renderer.setStyle(chartDom, 'width', width);
    this._renderer.setStyle(chartDom, 'height', height);
    return chartDom;
  }

}
