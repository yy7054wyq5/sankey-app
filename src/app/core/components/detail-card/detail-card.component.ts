import { Component, OnInit, HostBinding, Input, ElementRef, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ChartEventCbParams } from 'src/app/share/components/chart/chart.service';
import { CommonService } from '../../services/common/common.service';

interface DetailData {
  res?: any;
  type: 'case' | 'person' | 'company';
  node: ChartEventCbParams;
  id: string;
}

@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class DetailCardComponent implements OnInit {
  protected show = false;
  protected actives = [];
  protected _data;
  data: DetailData;

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Input()
  set dpcData(res: DetailData | null) {
    console.log(res);
    if (res) {
      this.show = res ? true : false;
      this.data = res;

      if (this.data.type !== 'case') {
        const arr = [];
        this.actives = [];
        for (const key in this.data.res.data) {
          if (this.data.res.data.hasOwnProperty(key)) {
            const value = this.data.res.data[key];
            if (!arr.length) {
              this.actives.push(false);
            } else {
              this.actives.push(true);
            }
            arr.push({
              key: key,
              value: value
            });
          }
        }
        this._data = arr;
      } else {
        this._data = this._exchangeCasesData(this.data.node.data.cases);
        console.log(this._data);
      }
    }
  }

  @Output()
  dpcClick = new EventEmitter<any>();

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  // https://stackoverflow.com/questions/46150788/inject-style-declarations-using-hostbinding-in-angular
  @HostBinding('style')
  get setStyle() {
    return this._san.bypassSecurityTrustStyle(`
      z-index: 2;
      position: absolute;
      top: 0;
      right: ${this.show ? '0' : '-15rem'};
      width: 15rem;
      height: ${this._e.nativeElement.parentElement.parentElement.clientHeight}px;
      transition: all 0.3s;
    `);
  }

  /////////////////////////////////////////////////////////////////////

  constructor(private _san: DomSanitizer, private _e: ElementRef, public common: CommonService) {}

  ngOnInit() {}

  /////////////////////////////////////////////////////////////////////

  UI_name(str: string) {
    if (str.indexOf(' ') > -1) {
      return str.split(' ')[1];
    }
    return str;
  }

  UI_outCollapse(bool: boolean, index: number) {
    this.actives[index] = bool;
    console.log(bool, index, this.actives);
    if (bool === false) {
      for (let i = 0; i < this.actives.length; i++) {
        if (i !== index) {
          this.actives[i] = true;
        }
      }
      this.actives = [...this.actives];
    }
  }

  UI_casePoint(tag) {
    const person = this.common.coreMainComponent.allNodes[this.data.node.data[tag]];
    if (person) {
      // console.log(this.data.node.data[tag], this.common.coreMainComponent.allNodes);
      const name = person.name;
      if (name.indexOf(' ') > -1) {
        return name.split(' ')[1];
      }
      return name;
    }
  }

  UI_clickCase(caseInfo) {
    // console.log(caseInfo);
    this.dpcClick.emit({
      id: caseInfo.case_id,
      name: caseInfo.case_name
    });
  }

  _exchangeCasesData(data: any[]) {
    const __data = [];
    const _data: { [year: number]: { [key: string]: string }[] } = {};
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      // {"case_id":"caseab0f3b41ec81db251a3dfd714dc23f44","case_name":"李文和与李贤玉、江苏省电力公司阜宁县供电公司等一般人格权纠纷一审","relation_date":2015
      const _item = JSON.parse(item);
      const _new_case_item = {
        case_id: _item.case_id,
        case_name: _item.case_name
      };

      if (!_data[_item.relation_date]) {
        _data[_item.relation_date] = [_new_case_item];
      } else {
        _data[_item.relation_date].push(_new_case_item);
      }
    }
    console.log(_data);
    Object.keys(_data)
      .sort()
      .reverse()
      .forEach(year => {
        __data.push({
          year,
          data: _data[year]
        });
      });
    console.log(__data);
    return __data;
  }

  UI_handlePanel() {
    this.show = !this.show;
  }

  UI_itemsLength(obj: Object) {
    if (obj) {
      return Object.keys(obj).length;
    }
    return '';
  }

  UI_clickItem(info) {
    // console.log(id);
    this.dpcClick.emit({
      id: info.key,
      name: info.value
    });
  }

  UI_viewMore() {
    // alert('building');
    this.dpcClick.emit({
      id: this.data.id,
      name:
        this.data.node.data.name
          .split(' ')
          .reverse()
          .join(' ') +
        ' ' +
        this.data.res['title']
    });
  }
}
