import { Component, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';
import { Observable, fromEvent, of, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, delay } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { DecryptData } from 'buyint-company-library/dist/index';
import { CheckTab, CheckOption } from '../check-node/check-node.component';
import { LoadingService } from 'src/app/share/services/loading/loading.service';
import { searchPersonApi, searchPersonRelationApi, searchPointApi, searchCompanyApi, searchCompanyRelationApi } from '../../config';

const noResultDis = {
  '2person': {
    txt: '暂时没有找到双方之间的交集事件，您可以通过点击图中名称查看他（们）各自的关系。',
    imgSrc: ''
  },
  '2company': {
    txt: '暂时没有找到双方之间的交集事件，您可以通过点击图中名称查看它（们）各自的关系。',
    imgSrc: ''
  },
  '1person': {
    txt: '我们正在努力更新他（她）的信息，请稍后再试。',
    imgSrc: '/assets/images/no-person.png'
  },
  '1company': {
    txt: '我们正在努力更新该企业的信息，请稍后再试。',
    imgSrc: '/assets/images/no-company.png'
  }
};

export { noResultDis };

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

export interface AjaxResponse {
  code: number;
  message: string;
  pages?: number;
  data: {
    minTimeLine: number;
    relation: Contacts;
  };
}

/**
 * 搜索数据返回
 *
 * @export
 * @interface SearchResult
 */
export interface Contacts {
  [contact: number]: Line[];
}

export interface Line {
  links: ChartLink[];
  nodes: ChartNode[];
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
  _key: string;
  role: string;
  title: string;
}
export interface OptionNew {
  name: string;
  _key: string;
  type: string;
  jobs: any;
  code: string;
}

/**
 * 内部记录有成功返回数据的起点和终点数据
 *
 * @interface TwoPointSuccessSearchRecord
 */
export interface TwoPointSuccessSearchRecord {
  start: { p_id: string; [key: string]: any; name?: string };
  end: { p_id: string; [key: string]: any; name?: string };
}

/**
 * 搜索关系的参数
 *
 * @interface SearchRelationRequestParams
 */
interface SearchRelationRequestParams {
  page?: number; // 当前页码
  source: string; // 起始点
  target?: string; // 终点
  timeLineEnd?: number; // 时间线结束时间 例如 2018
  timeLineStart?: number; // 时间线开始时间 例如2008
  weightEnd?: number; // 权重 0-1之间的值
  weightStart?: number; // 权重 0-1之间的值
  weight?: number;
  ignoreTimeLine?: boolean;
}

/**
 * 滑动条刻度数据结构
 *
 * @interface SliderMarks
 */
interface SliderMarks {
  [key: number]: string | { style: object; label: string };
}

interface CheckGroupItem {
  label: string;
  value: number | string;
  checked: boolean;
}

interface Slider {
  marks?: SliderMarks;
  min: number;
  max: number;
  disabled: boolean;
  value: number | number[];
  options?: CheckOption[];
}

/**
 * 单点记录
 *
 * @class OnePointRecord
 */
class OnePointRecord {
  storageName: string;
  constructor(storageName) {
    this.storageName = storageName;
  }
  start: Object;
  data: any[] = [];
  clear() {
    this.data = [];
  }
}

/**
 * 搜索记录集合以供侧栏显示，侧栏内历史记录的清空和点击历史项都是调用本组件的内部方法来实现的
 *
 * @interface Record
 */
class Record {
  storageName: string;
  constructor(storageName) {
    this.storageName = storageName;
  }
  // 起点终点的完整数据
  startAndEnd: TwoPointSuccessSearchRecord = {
    start: { p_id: '' },
    end: { p_id: '' }
  };
  // 有成功返回的搜索历史
  data = []; // TwoPointSuccessSearchRecord[]
  // 记录起点和终点的id集合，以免重复存入记录
  dataOnlyIds: { [key: string]: string[] } = {};
  // 清空记录的方法
  clear() {
    this.data = [];
    this.dataOnlyIds = {};
  }
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * 搜索模式
   *
   * @type {('2person' | '1person' | '2company' | '1company')}
   * @memberof SearchBarComponent
   */
  searchMode: '2person' | '1person' | '2company' | '1company' = '2person';

  searchModes = [
    {
      label: '两个人之间有哪些关系',
      value: '2person'
    },
    {
      label: '他的周围有哪些关系',
      value: '1person'
    },
    {
      label: '两个企业之间有哪些关系',
      value: '2company'
    },
    {
      label: '一个企业周围有哪些关系',
      value: '1company'
    }
  ];

  pointSelectPlaceholders = {
    '2person': ['请输入一方的姓名和企业名后，中间用空格分开', '请输入另一方的姓名和企业名后，中间用空格分开'],
    '1person': ['请输入姓名和企业名后，中间用空格分开', ''],
    '2company': ['请输入一方的企业名', '请输入另一方的企业名'],
    '1company': ['请输入企业名称', '']
  };

  get noResultDis() {
    if (this.searchResult === null) {
      if (this.start && this.end) {
        return 2;
      } else {
        return 1;
      }
    }
    return 0;
  }

  start: string; // 起点id
  end: string; // 终点id
  onePoint: string; // 单点

  startLoading = false; // 起点下拉loading开关
  endLoading = false; // 终点下拉loading开关
  onePointLoading = false; // 单点loading

  startOptions = []; // 起点下拉option数据
  endOptions = []; // 终点下拉option数据
  onePointOptions = []; // 终点下拉option数据

  // ignoreTime = false; // 忽略时间
  searchParams: SearchRelationRequestParams = {
    source: '',
    page: 0,
    ignoreTimeLine: false,
    timeLineEnd: new Date().getFullYear(),
    timeLineStart: 1970,
    weightStart: -1,
    weightEnd: 1
  };

  /**
   * 搜索结果
   * 当搜索无结果时，该值为null，用于判断无结果显示
   *
   * @memberof SearchBarComponent
   */
  searchResult: {
    minTimeLine: number;
    relation: {
      [key: number]: any[];
    };
  };

  get isOnePointMode() {
    return this.searchMode === '1company' || this.searchMode === '1person';
  }

  private _checkNodesTabSub: Subscription;

  /**
   * 记录集合
   *
   * @memberof SearchBarComponent
   */
  records = {
    '1person': new OnePointRecord('1personRecords'),
    '1company': new OnePointRecord('1companyRecords'),
    '2person': new Record('2personRecords'),
    '2company': new Record('2companyRecords')
  };

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
  outSearchResult = new EventEmitter<AjaxResponse>();

  /**
   * 传出搜索状态
   *
   * @memberof SearchBarComponent
   */
  @Output()
  outSearchStatus = new EventEmitter<string>();

  errorBakData: AjaxResponse = {
    code: 0,
    message: '',
    data: null
  };

  /**
   * 人脉
   *
   * @memberof SearchBarComponent
   */
  degrees: CheckGroupItem[];
  degreesDisabled = false;

  sliderChains: Slider = {
    marks: {},
    min: 0,
    max: 0,
    value: [],
    options: [],
    disabled: false
  };
  sliderTimelines: Slider = {
    marks: {},
    min: 0,
    max: 0,
    disabled: false,
    value: [this.searchParams.timeLineStart, this.searchParams.timeLineEnd]
  };
  sliderStrength: Slider = {
    marks: (() => {
      const tmp = {};
      for (let index = 0; index < 2; index++) {
        if (index === 0 || index === 1) {
          tmp[index] = {
            label: index
          };
        } else {
          tmp[index] = '';
        }
      }
      return tmp;
    })(),
    min: 0,
    max: 1,
    value: [0, 1],
    disabled: false
  };

  /**
   * 当前记录
   *
   * @readonly
   * @memberof SearchBarComponent
   */
  get crtRecord() {
    // const data = this.records[this.searchMode].data;
    // if (data.length) {
    //   console.log(this.searchMode, data);
    // }
    return this.records[this.searchMode];
  }

  get getSearchPointApi() {
    if (this.searchMode === '1company' || this.searchMode === '2company') {
      return searchCompanyApi;
    } else {
      return searchPersonApi;
    }
  }

  ///////////////////////////////////////////////////////////////

  constructor(
    public common: CommonService,
    public loading: LoadingService,
    private _http: HttpClient,
    private _element: ElementRef,
    private _storge: StorageService
  ) {}

  ngOnInit() {
    this._synRecordsByStoragesOnInitCycle();
  }

  ngAfterViewInit() {
    // 搜起点
    this._bindSearchEvent('start-point').subscribe(res => {
      this.startLoading = true;
      this._http
        .get(this.getSearchPointApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.startLoading = false;

            if (!bak.code) {
              // 現在
              this._concatDataNew(bak.data).subscribe(data => {
                this.startOptions = data;
              });
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
        .get(this.getSearchPointApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.endLoading = false;
            if (!bak.code) {
              this._concatDataNew(bak.data).subscribe(data => {
                this.endOptions = data;
              });
            }
          },
          error => {
            this.endLoading = false;
          }
        );
    });
    // 搜终点
    this._bindSearchEvent('one-point').subscribe(res => {
      this.onePointLoading = true;
      this._http
        .get(this.getSearchPointApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.onePointLoading = false;
            if (!bak.code) {
              this._concatDataNew(bak.data).subscribe(data => {
                this.onePointOptions = data;
              });
            }
          },
          error => {
            this.onePointLoading = false;
          }
        );
    });
  }

  ngOnDestroy() {
    this._checkNodesTabSub.unsubscribe();
  }

  ////////////////////////////////////////////////////////////////////////////////

  _initSlider() {
    this.searchParams = {
      source: '',
      page: 0,
      timeLineEnd: new Date().getFullYear(),
      timeLineStart: 1970,
      weightStart: -1,
      weightEnd: 1
    };
    this.sliderTimelines.min = this.searchParams.timeLineStart;
    this.sliderTimelines.max = this.searchParams.timeLineEnd;
    this.sliderTimelines.value = [this.sliderTimelines.min, this.sliderTimelines.max];
    this._creatTimelinesSlider(this.sliderTimelines.min, this.sliderTimelines.max);
    this.sliderStrength.value = [0, 1];
  }

  UI_searchModeChange(mode) {
    this.start = this.end = null;
    this.onePoint = null;
    this._initSlider();
    this.degreesDisabled = true;
    this._creatChainsSlider(true);
    this.sliderChains.disabled = true;
    this.outSearchResult.emit({
      code: 1,
      data: null,
      message: '切换模式'
    });
  }

  /**
   * 人脉
   *
   * @param {CheckGroupItem[]} _d
   * @memberof SearchBarComponent
   */
  UI_outCheckedDegrees(_d: CheckGroupItem[]) {
    const data = {
      out: [],
      hidden: []
    };
    for (let index = 0; index < _d.length; index++) {
      const item = _d[index];
      if (item.checked) {
        data.out.push(parseInt(item.value.toString(), 10));
      } else {
        data.hidden.push(parseInt(item.value.toString(), 10));
      }
    }
    this.common.coreMainComponent.getCheckedContacts(data);
  }

  /**
   * 滑动值
   *
   * @param {('chains' | 'timelines' | 'strength')} tag
   * @param {*} value
   * @memberof SearchBarComponent
   */
  UI_outCrtMark(tag: 'chains' | 'timelines' | 'strength', value) {
    console.log(tag, value);
    if (tag === 'chains') {
      const [start, end] = value;
      const options = this.sliderChains.options;
      const data = {
        out: options.slice(start, end),
        hidden: options.slice(end)
      };
      console.log(data);
      this.common.coreMainComponent.getCheckedNodes(data);
      return;
    } else if (tag === 'timelines') {
      this.searchParams.timeLineStart = value[0];
      this.searchParams.timeLineEnd = value[1];
    } else {
      console.log(value);
      this.searchParams.weightStart = value[0];
      this.searchParams.weightEnd = value[1];
    }

    of(value)
      .pipe(delay(400))
      .subscribe(_ => {
        this.search();
      });
  }

  /**
   * 创建滑动节点
   *
   * @private
   * @param {number} maxNumber
   * @param {number} [sections=3]
   * @returns {SliderMarks}
   * @memberof SearchBarComponent
   */
  private _creatChainsSliderMarks(maxNumber: number, sections: number = 3): SliderMarks {
    const unit = parseInt((maxNumber / sections).toString(), 10);
    const tmp = {};
    for (let index = 0; index < sections; index++) {
      tmp[index * unit] = '';
    }
    tmp[0] = 0;
    tmp[maxNumber] = maxNumber;
    return tmp;
  }

  /**
   * 创建路径滑动
   *
   * @private
   * @memberof SearchBarComponent
   */
  private _creatChainsSlider(toDefault?: boolean) {
    this.sliderChains = JSON.parse(JSON.stringify(this.sliderChains));

    if (toDefault) {
      this.sliderChains.marks = this._creatChainsSliderMarks(1);
      this.sliderChains.max = this.sliderChains.value = 1;
      this.sliderChains.value = [0, 1];
      return;
    }

    this.common.coreMainComponent.checkNodesTabSubject.subscribe((nodes: CheckTab[]) => {
      if (nodes.length) {
        const options = nodes[0].options.filter(option => {
          return option.canHidden;
        });
        const max = options.length;
        this.sliderChains.options = options;
        this.sliderChains.marks = this._creatChainsSliderMarks(max);
        this.sliderChains.max = this.sliderChains.value = max;
        this.sliderChains.value = [0, max];
      }
    });
  }

  /**
   * 创建时间范围滑动
   *
   * @private
   * @param {number} minTime
   * @param {number} maxTime
   * @memberof SearchBarComponent
   */
  private _creatTimelinesSlider(minTime: number, maxTime: number) {
    this.sliderTimelines = JSON.parse(JSON.stringify(this.sliderTimelines));
    this.sliderTimelines.max = maxTime;
    this.sliderTimelines.min = minTime;
    const crtYear = new Date().getFullYear();
    if (!minTime) {
      this.sliderTimelines.value = [0, maxTime || crtYear];
    } else {
      if (this.searchParams.timeLineStart < minTime) {
        this.sliderTimelines.value[0] = minTime;
      }
      if (this.searchParams.timeLineEnd > maxTime) {
        this.sliderTimelines.value[1] = maxTime;
      }
    }
    const cutYears = [-1, -3, -6, -10, -15];
    this.sliderTimelines.marks = {};
    this.sliderTimelines.marks[maxTime] = {
      style: {
        marginLeft: '-15.5%'
      },
      label: maxTime.toString()
    };
    for (let index = 0; index < cutYears.length; index++) {
      const cutYear = cutYears[index];
      const crt = maxTime + cutYear;
      if (crt > minTime) {
        this.sliderTimelines.marks[crt] = '';
      }
    }
    this.sliderTimelines.marks[minTime] = {
      style: {
        marginLeft: '-5%'
      },
      label: minTime.toString()
    };
    console.log(this.sliderTimelines.marks);
    // 时间刻度分别为当前年份-1，当前年份-3，当前年份-6，当前年份-10，当前年份-15，剩余所有
  }

  /**
   * 创建人脉复选框数据
   *
   * @private
   * @param {*} relations
   * @memberof SearchBarComponent
   */
  private _creatDegreesCheckbox(relations) {
    this.degrees = Object.keys(relations).map((contacts, idx) => {
      return {
        label: contacts,
        checked: idx === 0 ? true : false,
        value: contacts
      };
    });
  }

  /**
   * 请求之后
   *
   * @private
   * @param {AjaxResponse} res
   * @memberof SearchBarComponent
   */
  private _afterAjax(res: AjaxResponse) {
    this.searchResult = res.data;

    const relations = res.data.relation;
    const minTime = res.data.minTimeLine;
    const maxTime = new Date().getFullYear();

    this._creatDegreesCheckbox(relations);
    this._creatChainsSlider();
    this._creatTimelinesSlider(minTime, maxTime);
  }

  // 改变数据格式后数据改变结构适应相同id展示（新）
  private _concatDataNew(data: OptionNew[]): Observable<any[]> {
    const _tmp: { [id: string]: { name: string; p_id: string; company?: string; info: any; c_name: string; p_title: string } } = {};
    if (data && data.length > 0) {
      data.forEach(item => {
        if (item && item.name) {
          const id = item._key || item.code;
          if (!_tmp[id]) {
            _tmp[id] = {
              name: item.name,
              p_id: id,
              // company: item.company,
              info: item.jobs,
              c_name: item['c_name'],
              p_title: item['p_title']
            };
          }
        }
      });
      const _arr = [];
      for (const id in _tmp) {
        if (_tmp.hasOwnProperty(id)) {
          const item = _tmp[id];
          _arr.push(item);
        }
      }
      return of(_arr);
    } else {
      return of([]);
    }
  }

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
   * 同步更新记录
   *
   * @private
   * @memberof SearchBarComponent
   */
  private _synRecordsByStoragesOnInitCycle() {
    for (const key in this.records) {
      if (this.records.hasOwnProperty(key)) {
        const record = this.records[key];
        const storage: any[] = this._storge.get(record.storageName);
        if (storage) {
          record.data = storage;
          if (record.storageName === '2companyRecords' || record.storageName === '2personRecords') {
            storage.forEach(s => {
              if (!record['dataOnlyIds'][s.start.p_id]) {
                record['dataOnlyIds'][s.start.p_id] = [s.end.p_id];
              } else {
                record['dataOnlyIds'][s.start.p_id].push(s.end.p_id);
              }
            });
          }
        }
      }
    }
  }

  /**
   * 更新记录
   *
   * @private
   * @memberof SearchBarComponent
   */
  private _updateRecords(): Observable<TwoPointSuccessSearchRecord[] | any[]> {
    if (this.isOnePointMode) {
      const data = this.crtRecord.data;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (this.onePoint === element.p_id) {
          return;
        }
      }
      this.crtRecord.data.unshift(this.onePointOptions[0]);
    } else {
      const startAndEnd = Object.assign({}, this.crtRecord['startAndEnd']);
      const start = startAndEnd.start.p_id;
      const end = startAndEnd.end.p_id;
      const recordsOnlyIds = this.crtRecord['dataOnlyIds'];
      if (!recordsOnlyIds[start]) {
        this.crtRecord['dataOnlyIds'][start] = [end];
        this.crtRecord.data.unshift(startAndEnd);
      } else {
        if (recordsOnlyIds[start].indexOf(end) < 0) {
          this.crtRecord['dataOnlyIds'][start].push(end);
          this.crtRecord.data.unshift(startAndEnd);
        }
      }
    }
    this._storge.put(this.crtRecord.storageName, this.crtRecord.data);
    return of(this.crtRecord.data);
  }

  /**
   * 清除历史
   *
   * @memberof SearchBarComponent
   */
  clearRecords() {
    this.crtRecord.clear();
    this._storge.remove(this.crtRecord.storageName);
  }

  /**
   * 是否请求到完整的数据
   *
   * @private
   * @param {SearchResult} res
   * @returns {boolean}
   * @memberof SearchBarComponent
   */
  private _isSuccessBack(res: AjaxResponse): boolean {
    if (!res.code) {
      if (res.data) {
        if (Object.keys(res.data.relation).length) {
          return true;
        }
        return false;
      }
      return false;
    }
    return false;
  }

  UI_searchPoint(point, mode) {
    this.searchParams.source = this.onePoint = point.p_id;
    this.onePointOptions = [point];
    this.start = this.end = null;
    this.searchParams.target = null;
    if (mode === '2person') {
      this.searchMode = '1person';
      this.search();
    } else if (mode === '2company') {
      this.searchMode = '1company';
      this.search();
    }
  }

  /**
   * 请求匹配关系
   *
   * @param {SuccessSearchRecord} [searchData]
   * @memberof SearchBarComponent
   */
  search(searchData?: TwoPointSuccessSearchRecord | any, initSearchParams?: boolean) {
    let searchApi = '';
    if (this.loading.status) {
      return;
    }

    if (initSearchParams) {
      this._initSlider();
    }

    this.searchParams.page = this.common.coreMainComponent.crtPageIndex;

    if (searchData) {
      this.common.coreMainComponent.crtPageIndex = this.searchParams.page = 1;
      if (this.isOnePointMode) {
        this.crtRecord['start'] = JSON.parse(JSON.stringify(searchData));
        this.onePointOptions = [searchData];
        this.onePoint = this.searchParams.source = searchData['p_id'];
        delete this.searchParams.target;
      } else {
        // 避免将外部变量的索引传入；导致内部记录，跟随起点或重点的选中使记录同步变化的问题
        this.crtRecord['startAndEnd'] = JSON.parse(JSON.stringify(searchData));
        this.startOptions = [searchData.start];
        this.endOptions = [searchData.end];
        this.start = this.searchParams.source = searchData.start.p_id;
        this.end = this.searchParams.target = searchData.end.p_id;
      }
      this.searchParams.timeLineStart = 1970;
      this.searchParams.timeLineEnd = new Date().getFullYear();
    }

    console.log(this.searchParams);

    if (!this.isOnePointMode) {
      if (this.searchMode === '2company') {
        searchApi = searchCompanyRelationApi;
      } else {
        searchApi = searchPersonRelationApi;
      }

      if (!this.start || !this.end) {
        return;
      }
      this.searchParams.source = this.start;
      this.searchParams.target = this.end;
    } else {
      searchApi = searchPointApi;
      if (!this.onePoint) {
        return;
      }
      this.searchParams.source = this.onePoint;
    }

    const params = { ...this.searchParams };

    this.outSearchStatus.emit(SearchStatus.pending);

    this._http
      .post<AjaxResponse>(searchApi, params, {
        withCredentials: true,
        observe: 'response',
        responseType: 'json'
      })
      .subscribe(
        (res: HttpResponse<AjaxResponse>) => {
          if (this._isSuccessBack(res.body)) {
            this.degreesDisabled = false;
            this.sliderChains.disabled = false;

            let data;
            if (res.headers.has('isEncryption') && res.headers.get('isEncryption')) {
              data = DecryptData.Decrypt<any>(<string>(<any>res.body.data), res.headers);
              res.body.data = data;
            } else {
              data = res.body.data;
            }

            for (const i in data) {
              if (data.hasOwnProperty(i)) {
                const concat = i;
                for (const j of data[i]) {
                  for (const z of j['links']) {
                    z['concat'] = concat;
                  }
                }
              }
            }
            this._afterAjax(res.body);

            // if (this.isOnePointMode) {
            //   const a = res.body.data.relation[2].splice(0, 54);
            //   console.log(a[a.length - 1]);
            //   res.body.data.relation[2] = a;
            // }
            this.outSearchResult.emit(res.body);

            this._updateRecords();
          } else {
            this.outSearchResult.emit(this.errorBakData);
            this.searchResult = null;
            this.degreesDisabled = true;
            this.sliderChains.disabled = true;
          }
          this.outSearchStatus.emit(SearchStatus.success);
        },
        error => {
          this.searchResult = null;
          this.outSearchResult.emit(this.errorBakData);
          this.outSearchStatus.emit(SearchStatus.fail);
          this.degreesDisabled = true;
          this.sliderChains.disabled = true;
        },
        () => {
          this.outSearchStatus.emit(SearchStatus.complate);
        }
      );
  }

  /**
   * 更新起点和终点的完整数据
   *
   * @param {*} data
   * @param {string} tag
   * @memberof SearchBarComponent
   */
  UI_getStartAndEndData(data: any, tag?: string) {
    console.log('UI_getStartAndEndData', data);
    if (data.info) {
      data.p_title = this.lastOptionLable(data.info);
    }

    if (this.isOnePointMode) {
      this.crtRecord['start'] = data;
    } else {
      this.crtRecord['startAndEnd'][tag] = data;
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
    if (tag === 'start') {
      this.start = value;
    } else {
      this.end = value;
    }
  }

  // 查找存在
  searchName(eve: string, arr: any) {
    let status = '';
    for (const item of arr) {
      if (item.indexOf(eve) > -1 && eve.length === item.length) {
        status = item;
        break;
      }
    }
    return status;
  }

  /**
   * 返回option最后显示的值
   *
   * @param {Option} option
   * @returns
   * @memberof SearchBarComponent
   */
  lastOptionLable(option) {
    /**
     * 現代碼
     */
    if (Array.isArray(option)) {
      const optionObj = option['0'];
      const titleArray = optionObj.p_titles.length === 0 ? '' : optionObj.p_titles;

      // 董事长 ，总经理，总裁优先
      const nameOne = '董事长';
      const nameTwo = '总裁';
      const nameThree = '总经理';
      let title = '';
      if (titleArray) {
        if (this.searchName(nameOne, titleArray)) {
          title = this.searchName(nameOne, titleArray);
        } else if (this.searchName(nameTwo, titleArray)) {
          title = this.searchName(nameTwo, titleArray);
        } else if (this.searchName(nameThree, titleArray)) {
          title = this.searchName(nameThree, titleArray);
        } else {
          title = optionObj.p_titles[0];
        }
      }

      const role = optionObj.p_roles.length === 0 ? '' : optionObj.p_roles[0];
      return title || role;
    } else {
      // 董事长 ，总经理，总裁优先
      const _nameOne = '董事长';
      const _nameTwo = '总裁';
      const _nameThree = '总经理';
      const titleArray = option.p_titles.length === 0 ? '' : option.p_titles;
      let title = '';
      if (titleArray) {
        if (this.searchName(_nameOne, titleArray)) {
          title = this.searchName(_nameOne, titleArray);
        } else if (this.searchName(_nameTwo, titleArray)) {
          title = this.searchName(_nameTwo, titleArray);
        } else if (this.searchName(_nameThree, titleArray)) {
          title = this.searchName(_nameThree, titleArray);
        } else {
          title = option.p_titles[0];
        }
      }

      const role = option.p_roles.length === 0 ? '' : option.p_roles[0];
      return title || role;
    }
  }
}
