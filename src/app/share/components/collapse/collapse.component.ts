import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.less']
})
export class CollapseComponent implements OnInit {
  @Input() colTitle: string;

  @Input() colIcon: string;

  @Input() colIsCollapse = true;

  @Output() isCollapse = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  toClick(bool) {
    this.colIsCollapse = !this.colIsCollapse;
    this.isCollapse.emit(bool);
  }
}
