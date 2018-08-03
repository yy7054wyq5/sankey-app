import { Component, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';
import { environment } from '../../../../environments/environment';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';

/**
 * 搜索的状态
 *
 * @enum {number}
 */
export enum SearchStatus {
  pending = 'pending',
  success = 'success',
  fail = 'fail',
  complate = 'complate'
}

/**
 * 搜索数据返回
 *
 * @export
 * @interface SearchResult
 */
export interface SearchResult {
  status: number;
  data: {
    links: ChartLink[];
    nodes: ChartNode[];
  };
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit, AfterViewInit {
  start: string;
  end: string;

  startLoading = false;
  endLoading = false;

  startOptions = [];
  endOptions = [];

  @Input() searchDelaytTime = 1000;
  @Output() searchResult = new EventEmitter<SearchResult>();
  @Output() searchStatus = new EventEmitter<string>();

  countSearchTimes = 1;
  tipsLeft = ['21rem', '59rem', '83rem'];
  tip: Element;

  constructor(
    private _http: HttpClient,
    private _common: CommonService,
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _storge: StorageService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.tip = this._element.nativeElement.querySelector('.search-tips');
    if (this._storge.get('noSearchTips')) {
      this.tip.remove();
    } else {
      this._showTips(true);
    }
    // 搜起点
    this._bindSearchEvent('start-point').subscribe(res => {
      this.startLoading = true;
      this._http
        .get('assets/mock/start-end.json', {
          params: { string: res }
        })
        .subscribe(
          (bak: { status: number; data: any[] }) => {
            if (!bak.status) {
              this.startOptions = bak.data;
            }
          },
          error => {
            this.startLoading = false;
          },
          () => {
            this.startLoading = false;
          }
        );
    });
    // 搜终点
    this._bindSearchEvent('end-point').subscribe(res => {
      this.endLoading = true;
      this._http
        .get('assets/mock/start-end.json', {
          params: { string: res }
        })
        .subscribe(
          (bak: { status: number; data: any[] }) => {
            if (!bak.status) {
              this.endOptions = bak.data;
            }
          },
          error => {
            this.endLoading = false;
          },
          () => {
            this.endLoading = false;
          }
        );
    });
  }

  ////////////////

  /**
   * 绑定搜索
   *
   * @private
   * @param {string} className
   * @returns {Observable<string>}
   * @memberof SearchBarComponent
   */
  private _bindSearchEvent(className: string): Observable<string> {
    const $input = this._element.nativeElement.querySelector('.' + className).querySelector('.ant-select-search__field');
    return fromEvent($input, 'input').pipe(
      map((e: Event) => e.target['value']),
      debounceTime(this.searchDelaytTime),
      distinctUntilChanged(),
      switchMap(value => of(value))
    );
  }

  /**
   * 移动提示
   *
   * @private
   * @param {string} value
   * @memberof SearchBarComponent
   */
  private _moveTips(value: string) {
    if (value === this.tipsLeft[2]) {
      this.tip.querySelector('div').innerHTML = '点击按钮获取结果';
    }
    this._renderer.setStyle(this.tip, 'left', value);
  }

  /**
   * 展示提示框
   *
   * @private
   * @param {boolean} show
   * @memberof SearchBarComponent
   */
  private _showTips(show: boolean) {
    if (this.tip) {
      this._renderer.setStyle(this.tip, 'display', show ? 'flex' : 'none');
    }
  }

  /**
   * 移除引导提示
   *
   * @private
   * @memberof SearchBarComponent
   */
  private _removeTips() {
    this.tip.remove();
    this._storge.put('noSearchTips', true);
  }

  /**
   * 请求匹配关系
   *
   * @memberof SearchBarComponent
   */
  search() {
    if (environment.production && (!this.start || !this.end)) {
      return;
    }

    const url = (() => {
      return `assets/mock/search-result${this.countSearchTimes}.json`;
    })();

    this.countSearchTimes += 1;
    if (this.countSearchTimes === 4) {
      this.countSearchTimes = 1;
    }

    this.searchStatus.emit(SearchStatus.pending);
    this._http
      .get(url, {
        params: {
          source: this.start,
          target: this.end
        }
      })
      .subscribe(
        (res: SearchResult) => {
          this.searchStatus.emit(SearchStatus.success);
          this.searchResult.emit(res);
        },
        error => {
          this.searchStatus.emit(SearchStatus.fail);
          this._removeTips();
        },
        () => {
          this.searchStatus.emit(SearchStatus.complate);
          this._removeTips();
        }
      );
  }

  /**
   * 打开下拉框
   *
   * @param {*} value
   * @memberof SearchBarComponent
   */
  open(isopen: boolean) {
    if (isopen) {
      this._showTips(false);
    }
  }

  /**
   * 选中
   *
   * @param {*} value
   * @param {string} tag
   * @memberof SearchBarComponent
   */
  selected(value: any, tag: string) {
    this._showTips(true);
    if (tag === 'start') {
      this.start = value;
      this._moveTips(this.tipsLeft[1]);
    } else {
      this.end = value;
      this._moveTips(this.tipsLeft[2]);
    }
  }
}
