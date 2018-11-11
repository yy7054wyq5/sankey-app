import { Component, OnInit, HostBinding, Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.less']
})
export class DetailPanelComponent implements OnInit {

  // https://stackoverflow.com/questions/46150788/inject-style-declarations-using-hostbinding-in-angular
  @HostBinding('style')
  get setStyle() {
    return this._san.bypassSecurityTrustStyle(`
      z-index: 2;
      position: absolute;
      top: 2rem;
      right: 1rem;
      width: 14rem;
    `);
  }

  constructor(
    private _san: DomSanitizer
  ) { }

  ngOnInit() {
  }

}
