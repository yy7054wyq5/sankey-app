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
  Output,
  EventEmitter,
  SimpleChange
} from '@angular/core';
import * as echarts from 'echarts';
import theme from './theme';
import { ChartService, ChartEventCbParams } from './chart.service';
import { chartColorConfig } from '../../../core/config';
import { of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

enum FullStatus {
  yes = 'yes',
  no = 'no'
}

const ChartStandardSize = 5;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [ChartService]
})
export class ChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input()
  ehasFullBtn = true;
  @Input()
  set echartToFull(bool) {
    this.fullStatus = bool ? FullStatus.yes : FullStatus.no;
  }
  @Input()
  ewidth: string;
  @Input()
  eheight: string;
  @Input()
  efullParentClassName: string;
  @Input()
  eoption: any; // http://echarts.baidu.com/option.html
  @Input()
  set elines(lines) {
    this._lines = lines;
  }
  @Output()
  efullStatus = new EventEmitter<boolean>();
  @Output()
  emouseover = new EventEmitter<any>();
  @Output()
  eclick = new EventEmitter<any>();
  @Output()
  isView = new EventEmitter<boolean>();

  selectOpenStatus = false;
  // 鼠标经过或点击的文字
  UI_nodeDetail = {
    show: false,
    date: '',
    txt: '',
    txt1: '',
    id: '',
    showType: ''
  };

  colorBar = chartColorConfig;
  fullStatus = FullStatus.no; // yes为全屏

  /**
   * 图表dom结构
   *
   * @type {Element}
   * @memberof ChartComponent
   */
  chartDom: Element; // 图表结构
  chartContainer: Element; // 整个组件
  chartInstance: any; // 图表实例
  bindedEvent: boolean; // 是否已绑定事件
  unlistenDomParentResize: any; // 监听窗口大小变化事件
  clickedNode: ChartEventCbParams;
  thisPageButton = false;

  _lines;
  chartSize = ChartStandardSize;
  oneChartSize = {
    width: 0,
    height: 0
  };

  get chartActived() {
    // 图表是否激活
    return this.chartInstance ? true : false;
  }

  constructor(private _chart: ChartService, private _element: ElementRef, private _renderer: Renderer2, private _zone: NgZone) {}

  ngOnChanges(changes: { eoption: SimpleChange; eheight: SimpleChange }) {
    if (changes) {
      if (changes.eoption && !changes.eoption.isFirstChange()) {
        if (!this.chartInstance) {
          this._initChart();
        } else {
          this._setOption();
        }
      }

      if (changes.eheight) {
        if (!this.chartInstance) {
          this._initChart();
        } else {
          this._setChartWH(this.chartDom, null, this.eheight);
          this._resizeChart();
        }
      }
      // this.thisPageButton = this.viewStatusChart;
      // this.changeClickView();
      // debugger;
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
    this.unlistenDomParentResize = this._renderer.listen(window, 'resize', () => {
      this._resizeChart();
    });
  }

  ngOnDestroy() {
    this._destroyChart();
    this.eoption = null;
    this.clickedNode = null;
    this.unlistenDomParentResize();
  }

  /**
   *
   */
  changeClickView() {
    this.thisPageButton = !this.thisPageButton;
    this.isView.emit(this.thisPageButton);
  }

  /////////////////////////////////////////////////

  private _setOption() {
    this.chartSize = ChartStandardSize;
    const oneSizeHeight = this.chartInstance.getHeight() / ChartStandardSize;
    const oneSizeWidth = this.chartInstance.getWidth() / ChartStandardSize;
    this.oneChartSize = { width: oneSizeWidth, height: oneSizeHeight };
    this.chartInstance.setOption({ ...this.eoption, width: 'auto', height: 'auto' });
    // console.log(this.oneChartSize);
  }

  slider(value) {
    console.log(this.oneChartSize, value);
    // this._zone.runOutsideAngular(() => {
    // });
    this._setChartWH(this.chartDom, this.oneChartSize.width * value + 'px', this.oneChartSize.height * value + 'px');
    this._resizeChart();
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
   * 全屏切换
   *
   * @param {string} tag
   * @memberof ChartComponent
   */
  public toFull(tag: string) {
    this.fullStatus = FullStatus[tag];
    this.mustResize();
    this.efullStatus.emit(tag === FullStatus.yes ? true : false);
    if (tag === FullStatus.yes) {
      this._renderer.setAttribute(document.body, 'style', `height: ${window.innerHeight}; overflow:hidden;`);
      // this._f11(document, true);
    } else {
      this._renderer.setAttribute(document.body, 'style', '');
      // this._f11(document, false);
    }
  }

  private _f11(dom, open: boolean) {
    if (open) {
      if (dom.requestFullscreen) {
        dom.requestFullscreen();
      } else if (dom.msRequestFullscreen) {
        dom.msRequestFullscreen();
      } else if (dom.mozRequestFullScreen) {
        dom.mozRequestFullScreen();
      } else if (dom.webkitRequestFullscreen) {
        dom.webkitRequestFullscreen();
      }
    } else {
      // dom.exitFullscreen();
    }
  }

  public mustResize() {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/Event
    setTimeout(() => {
      const ev = new Event('resize', { bubbles: true, cancelable: false });
      window.dispatchEvent(ev);
    }, 1);
  }

  /**
   * 改变全屏样式
   *
   * @private
   * @memberof ChartComponent
   */
  private _exchangeContainerStyle() {
    if (this.fullStatus === 'yes') {
      // 先使图表脱离文档流，使文档恢复原始状态，因为是flex布局，所以不用考虑没有高度的问题
      this._setStyle(this.chartContainer, {
        position: 'fixed'
      });
      const wraper = document.querySelector('.' + this.efullParentClassName);
      // 设置图表容器的宽高和定位
      this._setStyle(this.chartContainer, {
        left: wraper['offsetLeft'],
        top: wraper['offsetTop'],
        width: wraper.clientWidth,
        height: wraper.clientHeight
      });
      // this.efullStatus.emit(true);
    } else {
      this._setStyle(this.chartContainer, {
        position: 'relative',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      });
      // var pointInfo = document.getElementsByClassName('point-info');
      // pointInfo
      // this.efullStatus.emit(false);
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
      // this.chartInstance.setOption(this.eoption);
      this._setOption();
    });
    if (!this.bindedEvent) {
      this._bindEvent();
      this.bindedEvent = true;
    }
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
   * 显示点的信息
   *
   * @private
   * @memberof ChartComponent
   */
  private _showNodeInfo(params: ChartEventCbParams): void {
    if (params.dataType === 'node') {
      const names = this.handleDataName(params.data.name);
      this._zone.run(() => {
        this.UI_nodeDetail = {
          show: true,
          date: params.data.date,
          txt: names[0],
          txt1: names[1],
          id: params.data.id,
          showType: 'node'
        };
      });
    } else if (params.dataType === 'edge') {
      // 边的显示
      const edgeName = params.data && params.data.relation ? params.data.relation : '';
      this._zone.run(() => {
        this.UI_nodeDetail = {
          show: true,
          date: '',
          txt1: '',
          txt: edgeName,
          id: '',
          showType: 'edge'
        };
      });
    } else {
      return;
    }
  }

  private handleDataName(name: string): string[] {
    const names = name.split('<br>');
    if (names.length > 1) {
      return names;
    } else {
      return [name, ''];
    }
  }

  /**
   * 绑定事件
   *
   * @private
   * @memberof ChartComponent
   */
  private _bindEvent() {
    // 点击事件
    const chart = this.chartInstance;
    this.chartInstance.on('click', (params: ChartEventCbParams) => {
      console.log(params);
      // this.chartInstance.setOption(this.eoption);
      this._zone.run(() => {
        this.eclick.emit({
          crtNode: params,
          chartInstance: chart
        });
      });
      this._highlightNode(params);
    });
    // 鼠标经过事件
    this.chartInstance.on('mouseover', (params: ChartEventCbParams) => {
      this._zone.run(() => {
        of(1)
          .pipe(debounceTime(400))
          .subscribe(n => {
            this.emouseover.emit(params);
          });
      });
      // this._showNodeInfo(params);
    });
  }

  /**
   * 设置宽高（核心）
   * 图表生成变化之基础，改变图表dom元素宽高
   *
   * @private
   * @param {Element} chartDom
   * @param {string} width
   * @param {string} height
   * @returns {Element}
   * @memberof ChartComponent
   */
  private _setChartWH(chartDom: Element, width: string, height: string): Element {
    this._setStyle(chartDom, { width: width || '100%', height: height || '100%' });
    return chartDom;
  }
}
