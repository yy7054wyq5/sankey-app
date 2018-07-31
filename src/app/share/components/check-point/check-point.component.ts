import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-check-point',
  templateUrl: './check-point.component.html',
  styleUrls: ['./check-point.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckPointComponent implements OnInit {
  show: boolean;
  pointsTag = 'company';

  constructor() {}

  ngOnInit() {}

  //////

  showItems(tag: string) {
    this.pointsTag = tag;
  }
}
