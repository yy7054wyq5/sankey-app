import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../services/common/common.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {
  start: string;
  end: string;

  constructor(private _http: HttpClient, private _common: CommonService) {}

  ngOnInit() {}

  ////////////////

  search() {
    this._http.get('assets/mock/search-result.json').subscribe(data => {
      this._common.search$.next(data);
    });
  }
}
