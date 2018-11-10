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
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';
import { Observable, fromEvent, of, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, min } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { environment } from '../../../../environments/environment';
import { DecryptData } from 'buyint-company-library/dist/index';
import { CheckTab, CheckOption } from '../check-node/check-node.component';

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
  value: number;
  options?: CheckOption[];
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

const searchPersonApi = '/api/web/Extract/extractNew';
const searchPersonApiTest = 'getData';
// let searchRelationApi = '/api/web/Relation/relation';
let searchRelationApi = '/api/web/Relation/aiGuanXiRelation';

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
   * @type {('startEnd' | 'onePoint')}
   * @memberof SearchBarComponent
   */
  searchMode: 'startEnd' | 'onePoint' = 'onePoint';

  searchModes = [
    {
      label: '关系路径查询',
      value: 'startEnd'
    },
    {
      label: '单点周围关系查询',
      value: 'onePoint'
    }
  ];

  start: string; // 起点id
  end: string; // 终点id
  onePoint: string; // 单点

  startLoading = false; // 起点下拉loading开关
  endLoading = false; // 终点下拉loading开关
  onePointLoading = false; // 单点loading

  startOptions = []; // 起点下拉option数据
  endOptions = []; // 终点下拉option数据
  onePointOptions = []; // 终点下拉option数据

  searchParams: SearchRelationRequestParams = {
    source: '',
    page: 0,
    timeLineEnd: 0,
    timeLineStart: 0
  };

  searchResult;

  private _checkNodesTabSub: Subscription;

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
  outSearchResult = new EventEmitter<AjaxResponse>();

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

  sliderChains: Slider = {
    marks: {},
    min: 0,
    max: 0,
    value: 0,
    options: []
  };
  sliderTimelines: Slider = {
    marks: {},
    min: 0,
    max: 0,
    value: 0
  };
  sliderStrength: Slider = {
    marks: (() => {
      const tmp = {};
      for (let index = 0; index < 11; index++) {
        const i = (0.1 * index).toFixed(1);
        if (index === 0 || index === 10) {
          tmp[i] = {
            style: {
              marginLeft: index === 0 ? '-4%' : '-5%'
            },
            label: parseInt(i, 10)
          };
        } else {
          tmp[i] = '';
        }
      }
      return tmp;
    })(),
    min: 0,
    max: 1,
    value: 0.2
  };

  constructor(
    public common: CommonService,
    private _http: HttpClient,
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
      // this._showTips(true);
    }
    // 搜起点
    this._bindSearchEvent('start-point').subscribe(res => {
      this.startLoading = true;
      this._http
        .get(searchPersonApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.startLoading = false;

            if (!bak.code) {
              // 假数据
              // bak.data = [{
              //   name: "朱根林",
              //   _key: "persond232dfaca4cd8cdae25dd3c739201623",
              //   jobs:[
              //     {
              //       c_id:'organization2f6a16d707e12973356ccaf749f5de79',
              //       c_loc:'',
              //       c_name:'深圳市洲明科技股份有限公司',
              //       p_gender:'男',
              //       p_name:'陆晨',
              //       p_roles:['高管','白領'],
              //       p_titles:['非独立董事','副总经理','董事'],
              //       relation_dates:['2018','2017']
              //     }
              //   ],
              //   type:'person',
              // }]

              // 原來
              // this._concatData(bak.data).subscribe(data => {
              //   this.startOptions = data;
              // });

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
        .get(searchPersonApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.endLoading = false;
            if (!bak.code) {
              // 假数据
              // bak.data = [{
              //   name: "潘岳汉",
              //   _key: "person3ba5d60eb9322dba7c9473a073479fbe",
              //   jobs:[
              //     {
              //       c_id:'organization2f6a16d707e12973356ccaf749f5de79',
              //       c_loc:'',
              //       c_name:'深圳市洲明科技股份有限公司',
              //       p_gender:'男',
              //       p_name:'陆晨',
              //       p_roles:['高管','白領'],
              //       p_titles:['副总经理','董事'],
              //       relation_dates:['2018','2017']
              //     },
              //     {
              //       c_id:'organization2f6a16d707e12973356ccaf749f5de79',
              //       c_loc:'',
              //       c_name:'上海市洲明科技股份有限公司',
              //       p_gender:'男',
              //       p_name:'陆晨',
              //       p_roles:['白領','經歷'],
              //       p_titles:['副总经理','董事'],
              //       relation_dates:['2018','2017']
              //     }
              //   ],
              //   type:'person',
              // }]

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
        .get(searchPersonApi, {
          params: { name: res }
          // params: { string: res }
        })
        .subscribe(
          (bak: { code: number; data: any[] }) => {
            this.onePointLoading = false;
            if (!bak.code) {
              // 假数据
              // bak.data = [{
              //   name: "潘岳汉",
              //   _key: "person3ba5d60eb9322dba7c9473a073479fbe",
              //   jobs:[
              //     {
              //       c_id:'organization2f6a16d707e12973356ccaf749f5de79',
              //       c_loc:'',
              //       c_name:'深圳市洲明科技股份有限公司',
              //       p_gender:'男',
              //       p_name:'陆晨',
              //       p_roles:['高管','白領'],
              //       p_titles:['副总经理','董事'],
              //       relation_dates:['2018','2017']
              //     },
              //     {
              //       c_id:'organization2f6a16d707e12973356ccaf749f5de79',
              //       c_loc:'',
              //       c_name:'上海市洲明科技股份有限公司',
              //       p_gender:'男',
              //       p_name:'陆晨',
              //       p_roles:['白領','經歷'],
              //       p_titles:['副总经理','董事'],
              //       relation_dates:['2018','2017']
              //     }
              //   ],
              //   type:'person',
              // }]

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
    this.clearRecords();
    this._checkNodesTabSub.unsubscribe();
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * 人脉
   *
   * @param {CheckGroupItem[]} _d
   * @memberof SearchBarComponent
   */
  UI_outCheckedDegrees(_d: CheckGroupItem[]) {
    console.log(_d);
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
      const options = this.sliderChains.options;
      const data = {
        out: options.slice(0, value),
        hidden: options.slice(value)
      };
      this.common.coreMainComponent.getCheckedNodes(data);
    } else if (tag === 'timelines') {
      this.searchParams.timeLineStart = this.sliderTimelines.min;
      this.searchParams.timeLineEnd = value;
    } else {
      // this.
    }
    console.log(this.searchParams);
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
      tmp[index * unit] = index * unit;
    }
    tmp[maxNumber] = maxNumber;
    return tmp;
  }

  /**
   * 创建路径滑动
   *
   * @private
   * @memberof SearchBarComponent
   */
  private _creatChainsSlider() {
    this.common.coreMainComponent.checkNodesTabSubject.subscribe((nodes: CheckTab[]) => {
      if (nodes.length) {
        const options = nodes[0].options.filter(option => {
          return option.canHidden;
        });
        const max = options.length;
        this.sliderChains.options = options;
        this.sliderChains.marks = this._creatChainsSliderMarks(max);
        this.sliderChains.max = this.sliderChains.value = max;
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
    this.sliderTimelines.min = minTime;
    this.sliderTimelines.max = this.sliderTimelines.value = maxTime;
    const timeLines = [];
    const cutYears = [-1, -3, -6, -10, -15];
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
        marginLeft: '-6.5%'
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
        label: contacts + '度',
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

  /**
   * 将数据改变结构以适应相同id数据的展示（旧）
   *
   * @private
   * @param {Option[]} data
   * @returns {Observable<any[]>}
   * @memberof SearchBarComponent
   */

  // private _concatData(data: Option[]): Observable<any[]> {
  //   const _tmp: { [id: string]: { name: string; p_id: string; company: string; info: Option[] } } = {};
  //   data.forEach(item => {
  //     if (item && item.name) {
  //       if (!_tmp[item.p_id]) {
  //         _tmp[item.p_id] = {
  //           name: item.name,
  //           p_id: item.p_id,
  //           company: item.company,
  //           info: []
  //         };
  //       }
  //       _tmp[item.p_id].info.push(item);
  //     }
  //   });
  //   const _arr = [];
  //   for (const id in _tmp) {
  //     if (_tmp.hasOwnProperty(id)) {
  //       const item = _tmp[id];
  //       _arr.push(item);
  //     }
  //   }
  //   return of(_arr);
  // }

  // 改变数据格式后数据改变结构适应相同id展示（新）
  private _concatDataNew(data: OptionNew[]): Observable<any[]> {
    const _tmp: { [id: string]: { name: string; p_id: string; company?: string; info: any; c_name: string; p_title: string } } = {};
    if (data && data.length > 0) {
      data.forEach(item => {
        if (item && item.name) {
          if (!_tmp[item._key]) {
            _tmp[item._key] = {
              name: item.name,
              p_id: item._key,
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
  private _isSuccessBack(res: AjaxResponse): boolean {
    if (!res.code) {
      if (res.data) {
        if (Object.keys(res.data).length) {
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
    this.searchParams.page = this.common.coreMainComponent.crtPageIndex - 1;

    if (searchData) {
      // 避免将外部变量的索引传入；导致内部记录，跟随起点或重点的选中使记录同步变化的问题
      this.records.startAndEnd = JSON.parse(JSON.stringify(searchData));
      this.startOptions = [searchData.start];
      this.endOptions = [searchData.end];
      this.start = this.searchParams.source = searchData.start.p_id;
      this.end = this.searchParams.target = searchData.end.p_id;
      if (this.start && this.end) {
        this.searchMode = 'startEnd';
      }
    }

    console.log(this.searchParams);

    if (!environment.production && !environment.apiHost) {
      this.records.startAndEnd.start.p_id = this.start = 'person428ca08fc6bbdf6831016685aaaf2ee4';
      this.records.startAndEnd.end.p_id = this.end = 'personc36e100160ac09a2642cee7081d07f74';
      searchRelationApi = '/assets/mock/relation-latest.json';
      this._http.get<AjaxResponse>(searchRelationApi).subscribe(res => {
        this._afterAjax(res);

        this.outSearchResult.emit(res);
        this._updateRecords().subscribe(data => {
          this.outSearchSuccessRecords.emit(data);
        });
      });
      return;
    }

    if (this.searchMode === 'startEnd') {
      if (!this.start || !this.end) {
        return;
      }
    } else {
      if (!this.onePoint) {
        return;
      }
    }

    this.outSearchStatus.emit(SearchStatus.pending);

    this.searchParams.source = this.start;
    this.searchParams.target = this.end;

    this._http
      .post<AjaxResponse>(searchRelationApi, this.searchParams, {
        withCredentials: true,
        observe: 'response',
        responseType: 'json',
      })
      .subscribe(
        (res: HttpResponse<AjaxResponse>) => {
          if (this._isSuccessBack(res.body)) {
            let data;
            this.searchResult = res.body;
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

            // 原代码
            // for (let i in data) {
            //   let concat = i;
            //   for (let j of data[i]) {
            //     for (let z of j['links']) {
            //       z['concat'] = concat;
            //     }
            //   }
            // }

            this._afterAjax(res.body);

            this.outSearchResult.emit(res.body);
            this._updateRecords().subscribe(_data => {
              this.outSearchSuccessRecords.emit(_data);
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
     * 原代碼
     */
    // if (Array.isArray(option)) {
    //   const _option = option[option.length - 1];
    //   return _option.title || _option.role;
    // } else {
    //   return option.title || option.role;
    // }
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
