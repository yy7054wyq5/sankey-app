import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { RemService } from './share/services/rem/rem.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  _unlistenWindowResize: any;

  constructor(
    private _title: Title,
    private _rem: RemService,
    private _renderer: Renderer2) {
  }

  ngOnInit() {
    this._rem.setDpr();
    this._title.setTitle('sn');
    this._unlistenWindowResize = this._renderer.listen('window', 'resize', () => {
      this._rem.setDpr();
    });
  }

  ngOnDestroy() {
    this._unlistenWindowResize();
  }
}
