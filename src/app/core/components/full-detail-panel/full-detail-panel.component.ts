import { Component, OnInit, HostBinding, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../services/common/common.service';

@Component({
  selector: 'app-full-detail-panel',
  templateUrl: './full-detail-panel.component.html',
  styleUrls: ['./full-detail-panel.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class FullDetailPanelComponent implements OnInit {
  protected show = false;
  protected data;
  _data;

  protected itemBorderColor = ['rgb(0, 203,255)', 'rgb(41,150,247)', 'rgb(82,97,231)', 'rgb(123,40,214)', 'rgb(156,0,206)'];

  ////////////////////////////////////////////////////////////////////////////////

  @Input()
  set fpcData(_data) {
    this.data = _data;
    console.log('fpcData', _data);
    this._exchangeData(_data);
  }

  ////////////////////////////////////////////////////////////////////////////////

  get detailType() {
    return this.data ? this.data.type : null;
  }

  @HostBinding('style')
  get setStyle() {
    return this._san.bypassSecurityTrustStyle(`
      z-index: 2;
      background-color: #fff;
      position: absolute;
      top: 0;
      left: ${this.show ? '0' : '-82rem'};
      width: 82rem;
      height: ${this._e.nativeElement.parentElement.parentElement.clientHeight}px;
      transition: all 0.3s;
      border-radius: 6px;
      overflow: auto;
    `);
  }

  /////////////////////////////////////////////////////////////////////////////////////

  constructor(private _san: DomSanitizer, private _e: ElementRef, public commonService: CommonService) {}

  ngOnInit() {}

  /////////////////////////////////////////////////////////////////////////////////////

  private _exchangeData(_data) {
    if (_data) {
      this.show = true;
      if (this.detailType === 'person') {
        this._data = this.UI_objToArr(this.data.res.data);
      } else if (this.detailType === 'organization') {
        this._data = this.UI_objToArr(this.data.res);
      } else {
        this._data = this.data.res;
      }
    } else {
      this.show = false;
    }
  }

  UI_viewFullDetail(data: { [key: string]: any }) {
    this.commonService.requestNodeInfo(data.key || data.id).subscribe(res => {
      const _res = { ...res, name: data.value || data.name };
      this.data = _res;
      this._exchangeData(_res);
    });
  }

  UI_chooseColor(index) {
    if (index < 5) {
      return this.itemBorderColor[index];
    } else {
      return this.itemBorderColor[index % 5];
    }
  }

  /**
   * 将对象数据转换为数组
   *
   * @param {*} obj
   * @memberof FullDetailPanelComponent
   */
  UI_objToArr(obj) {
    const arr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        arr.push({
          key: key,
          value: value
        });
      }
    }
    // console.log('UI_objToArr', arr);
    return arr;
  }

  UI_handlePanel() {
    this.show = !this.show;
  }

  UI_title(obj: any) {
    return `${obj.key}(${Object.keys(obj.value).length})`;
  }
}
