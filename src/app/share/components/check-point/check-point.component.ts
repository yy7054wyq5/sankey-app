import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ChartNode } from '../chart/chart.service';

@Component({
  selector: 'app-check-point',
  templateUrl: './check-point.component.html',
  styleUrls: ['./check-point.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckPointComponent implements OnInit {
  show: boolean;
  pointsTag = 'company';

  @Input() nodes: ChartNode[];

  constructor() {}

  ngOnInit() {
    console.log(this.nodes);
  }

  //////

  showItems(tag: string) {
    this.pointsTag = tag;
  }
}
