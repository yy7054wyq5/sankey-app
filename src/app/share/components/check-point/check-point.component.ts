import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-check-point',
  templateUrl: './check-point.component.html',
  styleUrls: ['./check-point.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckPointComponent implements OnInit {
  @Input() show: boolean;

  constructor() {}

  ngOnInit() {}
}
