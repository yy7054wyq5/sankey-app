import { Component, OnInit, HostBinding, Sanitizer, Input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.less']
})
export class DetailPanelComponent implements OnInit {
  private _show = false;
  data;

  @Input()
  set dpcData(data: any | null) {
    this._show = data ? true : false;
    this.data = data;
  }

  // https://stackoverflow.com/questions/46150788/inject-style-declarations-using-hostbinding-in-angular
  @HostBinding('style')
  get setStyle() {
    return this._san.bypassSecurityTrustStyle(`
      z-index: 2;
      position: absolute;
      top: 0;
      right: ${this._show ? '0' : '-15rem'};
      width: 15rem;
      height: ${this._e.nativeElement.parentElement.parentElement.clientHeight}px;
      transition: all 0.3s;
    `);
  }

  constructor(private _san: DomSanitizer,
    private _e: ElementRef) {}

  ngOnInit() {}

  /////////////////////////////////////////////////////////////////////

  handlePanel() {
    this._show = !this._show;
  }
}
