import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.less']
})
export class PagingComponent implements OnInit {
  pageIndex = 1;
  _pageTotal = 0;

  private _preCrtIndex = 1;

  ////////////////////////////////////////////////////////////////////////////////

  @Input()
  set pageTotal(n: number) {
    this.pageIndex = 1;
    this._preCrtIndex = 1;
    this._pageTotal = n;
  }

  @Output() crtIndexChange = new EventEmitter<number>();

  ////////////////////////////////////////////////////////////////////////////////

  constructor() {}

  ngOnInit() {}

  ////////////////////////////////////////////////////////////////////////////////

  private emitCrtIndex(index: number) {
    if (index !== this._preCrtIndex) {
      this._preCrtIndex = index;
      this.crtIndexChange.emit(index);
    }
  }

  public handlePage(crtIndex: number) {
    console.log(crtIndex);
    if (crtIndex && crtIndex < this._pageTotal + 1) {
      this.pageIndex = crtIndex;
      console.log('handlePage', crtIndex);
      this.emitCrtIndex(crtIndex);
    }
  }

  public cutInput(index) {
    if (!isNaN(parseInt(index, 10))) {
      this.pageIndex = parseInt(index, 10);
      console.log('cutInput', this.pageIndex);
    } else {
      this.pageIndex = 1;
    }
    if (!index || index < this.pageIndex) {
      this.pageIndex = 1;
    }
    if (index > this._pageTotal) {
      this.pageIndex = this._pageTotal;
    }
    this.emitCrtIndex(this.pageIndex);
  }
}
