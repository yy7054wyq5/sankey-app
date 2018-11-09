import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { RemService } from './share/services/rem/rem.service';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  _unlistenWindowResize: any;

  constructor(private _title: Title, private _rem: RemService, private _renderer: Renderer2) {}

  ngOnInit() {
    this._rem.setDpr();
    this._title.setTitle('智配关系');
    this._unlistenWindowResize = this._renderer.listen('window', 'resize', () => {
      this._rem.setDpr();
    });
    const _date = new Date();
    _date.setDate(_date.getDate() + 30);
    _date.toUTCString();
    document.cookie = `token=${environment.tmpToken};expires=${_date};domain=.buyint.com`;
  }

  ngOnDestroy() {
    this._unlistenWindowResize();
  }
}
