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
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StorageService } from '../../../share/services/storage/storage.service';
import { ChartLink, ChartNode } from '../../../share/components/chart/chart.service';
import { environment } from '../../../../environments/environment';
import { DecryptData } from 'buyint-company-library/dist/index';

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
  data: Contacts;
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
let searchRelationApi = '/api/web/Relation/relationWithColorNew';

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

  get showFilter(): boolean {
    if (this.searchResult) {
      if (this.start && this.end) {
        this.searchMode = 'startEnd';
        return true;
      }
      if (this.onePoint) {
        this.searchMode = 'onePoint';
        return true;
      }
    }
    return false;
  }

  searchResult: any;

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
  }

  ////////////////////////////////////////////////////////////////////////////////

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
    if (searchData) {
      // 避免将外部变量的索引传入；导致内部记录，跟随起点或重点的选中使记录同步变化的问题
      this.records.startAndEnd = JSON.parse(JSON.stringify(searchData));
      this.startOptions = [searchData.start];
      this.endOptions = [searchData.end];
      this.start = searchData.start.p_id;
      this.end = searchData.end.p_id;
    }

    if (!environment.production) {
      // this.records.startAndEnd.start.p_id = this.start = 'persona137502e5f2211e881f0005056c00008';
      // this.records.startAndEnd.end.p_id = this.end = 'person8abbfaa65f2211e8afad005056c00008';
      // searchRelationApi = '/assets/mock/relation4.json';
      // this.records.startAndEnd.start.p_id = this.start = 'person7136dc2e5f2211e896ae005056c00008';
      // this.records.startAndEnd.end.p_id = this.end = 'persona137502e5f2211e881f0005056c00008';
    }

    if (!this.start || !this.end) {
      return;
    }

    this.outSearchStatus.emit(SearchStatus.pending);

    this._http
      .get<AjaxResponse>(searchRelationApi, {
        observe: 'response',
        responseType: 'json',
        params: { source: this.start, target: this.end }
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
            for (var i in data) {
              let concat = i;
              for (var j of data[i]) {
                for (var z of j['links']) {
                  z['concat'] = concat;
                }
              }
            }
            this.outSearchResult.emit(res.body);
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

  //查找存在
  searchName(eve: string, arr: any) {
    let status = '';
    for (let item of arr) {
      if (item.indexOf(eve) > -1 && eve.length == item.length) {
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
      let optionObj = option['0'];
      let titleArray = optionObj.p_titles.length == 0 ? '' : optionObj.p_titles;

      //董事长 ，总经理，总裁优先
      var nameOne = '董事长';
      var nameTwo = '总裁';
      var nameThree = '总经理';
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

      let role = optionObj.p_roles.length == 0 ? '' : optionObj.p_roles[0];
      return title || role;
    } else {
      //董事长 ，总经理，总裁优先
      var nameOne = '董事长';
      var nameTwo = '总裁';
      var nameThree = '总经理';
      let titleArray = option.p_titles.length == 0 ? '' : option.p_titles;
      let title = '';
      if (titleArray) {
        if (this.searchName(nameOne, titleArray)) {
          title = this.searchName(nameOne, titleArray);
        } else if (this.searchName(nameTwo, titleArray)) {
          title = this.searchName(nameTwo, titleArray);
        } else if (this.searchName(nameThree, titleArray)) {
          title = this.searchName(nameThree, titleArray);
        } else {
          title = option.p_titles[0];
        }
      }

      let role = option.p_roles.length == 0 ? '' : option.p_roles[0];
      return title || role;
    }
  }
}
