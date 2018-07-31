import { Component, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';

enum SearchStatus {
  pending = 'pending',
  success = 'success',
  fail = 'fail',
  complate = 'complate'
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

  startOptions = [];
  endOptions = [];

  @Input() searchDelaytTime = 1000;
  @Output() searchStatus = new EventEmitter<string>();

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
      this._http
        .get('assets/mock/start-end.json', {
          params: {
            string: res
          }
        })
        .subscribe((bak: { status: number; data: any[] }) => {
          if (!bak.status) {
            this.startOptions = bak.data;
          }
        });
    });
    // 搜终点
    this._bindSearchEvent('end-point').subscribe(res => {
      this._http
        .get('assets/mock/start-end.json', {
          params: {
            string: res
          }
        })
        .subscribe((bak: { status: number; data: any[] }) => {
          if (!bak.status) {
            this.endOptions = bak.data;
          }
        });
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
   * 请求匹配关系
   *
   * @memberof SearchBarComponent
   */
  search() {
    if (this.start && this.end) {
      this.searchStatus.emit(SearchStatus.pending);
      this._http
        .get('assets/mock/search-result.json', {
          params: {
            source: this.start,
            target: this.end
          }
        })
        .subscribe(
          data => {
            this.searchStatus.emit(SearchStatus.success);
            this._common.search$.next(data);
          },
          error => {
            this.searchStatus.emit(SearchStatus.fail);
          },
          () => {
            this.tip.remove();
            this._storge.put('noSearchTips', true);
            this.searchStatus.emit(SearchStatus.complate);
          }
        );
    }
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
