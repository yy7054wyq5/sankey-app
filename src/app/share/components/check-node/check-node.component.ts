import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ChartNode } from '../chart/chart.service';

interface UInodes {
  event: ChartNode[];
  company: ChartNode[];
}

@Component({
  selector: 'app-check-node',
  templateUrl: './check-node.component.html',
  styleUrls: ['./check-node.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckNodeComponent implements OnInit {
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
