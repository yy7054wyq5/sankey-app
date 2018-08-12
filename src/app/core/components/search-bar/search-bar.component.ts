import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { environment } from '../../../../environments/environment';

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
  code: number;
  message: string;
  data: {
    links: ChartLink[];
    nodes: ChartNode[];
  };
}

/**
 * 起点终点返回的数据
 *
 * @export
 * @interface Option
 */
export interface Option {
  name: string;
  company: string;
  p_id: string;
  role: string;
  title: string;
}

/**
 * 内部记录有成功返回数据的起点和终点数据
 *
 * @interface SuccessSearchRecord
 */
export interface SuccessSearchRecord {
  start: { p_id: string; [key: string]: any };
  end: { p_id: string; [key: string]: any };
}

/**
 * 搜索记录集合以供侧栏显示，侧栏内历史记录的清空和点击历史项都是调用本组件的内部方法来实现的
 *
 * @interface Record
 */
class Record {
  // 起点终点的完整数据
  startAndEnd: SuccessSearchRecord = {
    start: { p_id: '' },
    end: { p_id: '' }
  };
  // 有成功返回的搜索历史
  data: SuccessSearchRecord[] = [];
  // 记录起点和终点的id集合，以免重复存入记录
  dataOnlyIds: { [key: string]: string[] } = {};
  // 清空记录的方法
  // prettier-ignore
  clear = () => {
    this.data = [];
    this.dataOnlyIds = {};
  }
}

const searchPersonApi = '/api/web/Extract/extract';
let searchRelationApi = '/api/web/Relation/relation';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
  start: string; // 起点id
  end: string; // 终点id

  startLoading = false; // 起点下拉loading开关
  endLoading = false; // 终点下拉loading开关

  startOptions = []; // 起点下拉option数据
  endOptions = []; // 终点下拉option数据

  /**
   * 外部以模板变量的方式获取内部变量
   *
   * @memberof SearchBarComponent
   */
  records = new Record();

  /**
   * 搜索延迟时间
   *
   * @memberof SearchBarComponent
   */
  @Input()
  searchDelaytTime = 500;

  /**
   * 传出搜索结果
   *
   * @memberof SearchBarComponent
   */
  @Output()
  outSearchResult = new EventEmitter<SearchResult>();

  /**
   * 传出搜索状态
   *
   * @memberof SearchBarComponent
   */
  @Output()
  outSearchStatus = new EventEmitter<string>();

  /**
   * 传出搜索成功的记录
   *
   * @memberof SearchBarComponent
   */
  @Output()
  outSearchSuccessRecords = new EventEmitter<SuccessSearchRecord[]>();

  // 引导提示的偏移值
  tipsLeft = ['21rem', '59rem', '83rem'];
  // 提示
  tip: Element;
  errorBakData: SearchResult = {
    code: 0,
    message: '',
    data: {
      nodes: [],
      links: []
    }
  };

  constructor(
    private _http: HttpClient,
    private _common: CommonService,
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _storge: StorageService
  ) {}

  ngOnInit() {
    const histories: SuccessSearchRecord[] = this._storge.get('histories');
    if (histories) {
      this.records.data = histories;
      this._synRecordsByStorages(histories);
    }
  }

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
        .get(searchPersonApi, {
          params: { name: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.startLoading = false;
            if (!bak.code) {
              this.startOptions = bak.data;
            }
          },
          error => {
            this.startLoading = false;
          }
        );
    });
    // 搜终点
    this._bindSearchEvent('end-point').subscribe(res => {
      this.endLoading = true;
      this._http
        .get(searchPersonApi, {
          params: { name: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.endLoading = false;
            if (!bak.code) {
              this.endOptions = bak.data;
            }
          },
          error => {
            this.endLoading = false;
          }
        );
    });
  }

  ngOnDestroy() {
    this.clearRecords();
  }

  ////////////////////////////////////////////////////////////////////////////////

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
   * 同步更新记录
   *
   * @private
   * @param {SuccessSearchRecord[]} data
   * @memberof SearchBarComponent
   */
  private _synRecordsByStorages(data: SuccessSearchRecord[]) {
    data.forEach(item => {
      if (!this.records.dataOnlyIds[item.start.p_id]) {
        this.records.dataOnlyIds[item.start.p_id] = [item.end.p_id];
      } else {
        this.records.dataOnlyIds[item.start.p_id].push(item.end.p_id);
      }
    });
  }

  /**
   * 更新记录
   *
   * @private
   * @returns {Observable<SuccessSearchRecord[]>}
   * @memberof SearchBarComponent
   */
  private _updateRecords(): Observable<SuccessSearchRecord[]> {
    const data = Object.assign({}, this.records.startAndEnd);
    const start = data.start.p_id;
    const end = data.end.p_id;
    const recordsOnlyIds = this.records.dataOnlyIds;
    if (!recordsOnlyIds[start]) {
      this.records.dataOnlyIds[start] = [end];
      this.records.data.push(data);
    } else {
      if (recordsOnlyIds[start].indexOf(end) < 0) {
        this.records.dataOnlyIds[start].push(end);
        this.records.data.push(data);
      }
    }
    this._storge.put('histories', this.records.data);
    return of(this.records.data);
  }

  /**
   * 清除历史
   *
   * @memberof SearchBarComponent
   */
  clearRecords() {
    this.records.clear();
    this._storge.remove('histories');
  }

  /**
   * 是否请求到完整的数据
   *
   * @private
   * @param {SearchResult} res
   * @returns {boolean}
   * @memberof SearchBarComponent
   */
  private _isSuccessBack(res: SearchResult): boolean {
    if (!res.code) {
      if (res.data) {
        if (res.data.links && res.data.links.length > 0 && (res.data.nodes && res.data.nodes.length > 0)) {
          return true;
        }
        return false;
      }
      return false;
    }
    return false;
  }

  /**
   * 请求匹配关系
   *
   * @param {SuccessSearchRecord} [searchData]
   * @memberof SearchBarComponent
   */
  search(searchData?: SuccessSearchRecord) {
    if (searchData) {
      // 避免将外部变量的索引传入；导致内部记录，跟随起点或重点的选中使记录同步变化的问题
      this.records.startAndEnd = JSON.parse(JSON.stringify(searchData));
      this.startOptions = [searchData.start];
      this.endOptions = [searchData.end];
      this.start = searchData.start.p_id;
      this.end = searchData.end.p_id;
    }

    // if (!environment.production) {
    //   this.records.startAndEnd.start.p_id = this.start = 'persona137502e5f2211e881f0005056c00008';
    //   this.records.startAndEnd.end.p_id = this.end = 'person8abbfaa65f2211e8afad005056c00008';
    // }

    if (environment.useRelationJson) {
      searchRelationApi = '/assets/mock/relation-right.json';
    }

    if (!this.start || !this.end) {
      return;
    }

    this.outSearchStatus.emit(SearchStatus.pending);

    this._http.get(searchRelationApi, { params: { source: this.start, target: this.end } }).subscribe(
      (res: SearchResult) => {
        if (this._isSuccessBack(res)) {
          this.outSearchResult.emit(res);
          this._updateRecords().subscribe(data => {
            this.outSearchSuccessRecords.emit(data);
          });
        } else {
          this.outSearchResult.emit(this.errorBakData);
        }
        this.outSearchStatus.emit(SearchStatus.success);
      },
      error => {
        this.outSearchResult.emit(this.errorBakData);
        this.outSearchStatus.emit(SearchStatus.fail);
        this._removeTips();
      },
      () => {
        this.outSearchStatus.emit(SearchStatus.complate);
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
   * 更新起点和终点的完整数据
   *
   * @param {*} data
   * @param {string} tag
   * @memberof SearchBarComponent
   */
  getStartAndEndData(data: any, tag: string) {
    this.records.startAndEnd[tag] = data;
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

  /**
   * 返回option最后显示的值
   *
   * @param {Option} option
   * @returns
   * @memberof SearchBarComponent
   */
  lastOptionLable(option: Option) {
    return option.title || option.role;
  }
}
