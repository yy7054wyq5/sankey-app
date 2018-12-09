import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CollapseComponent implements OnInit {
  protected handleIcon = {
    1: ['+', '-'],
    2: ['>', '<']
  };

  @Input() colTitle: string;

  @Input() colIcon: string;

  @Input() colIsCollapse = true;

  @Input() colMode = 1;

  @Output() isCollapse = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  toClick(bool) {
    this.colIsCollapse = !this.colIsCollapse;
    this.isCollapse.emit(this.colIsCollapse);
    // console.log(bool);
  }
}
