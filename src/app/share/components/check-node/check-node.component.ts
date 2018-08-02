import { Component, OnInit, Input, ViewEncapsulation, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ChartNode } from '../chart/chart.service';
import { Observable, of } from '../../../../../node_modules/rxjs';

interface UInodes {
  persons: ChartNode[];
  cases: ChartNode[];
  organizations: ChartNode[];
}
enum Tag {
  case = 'case',
  organization = 'organization'
}

@Component({
  selector: 'app-check-node',
  templateUrl: './check-node.component.html',
  styleUrls: ['./check-node.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckNodeComponent implements OnInit, OnChanges {
  show: boolean;
  pointsTag = 'organization';
  uiNodes: UInodes;

  @Input() nodes: ChartNode[];
  @Output() outCheckedNodes = new EventEmitter<ChartNode[]>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && !changes.nodes.isFirstChange()) {
      this._creatData(this.nodes).subscribe(data => this.uiNodes = data);
    }
  }

  ngOnInit() {
    console.log(this.nodes);
    this._creatData(this.nodes).subscribe(data => this.uiNodes = data);
  }

  ////////////////////////////////////


  private _creatData(data: ChartNode[]): Observable<UInodes> {
    const tmp: UInodes = {
      cases: [],
      persons: [],
      organizations: []
    };
    data.forEach(node => {
      node.actived = true;
      if (node.id.indexOf(Tag.case) > -1) {
        tmp.cases.push(node);
      } else if (node.id.indexOf(Tag.organization) > -1) {
        tmp.organizations.push(node);
      } else {
        tmp.persons.push(node);
      }
    });
    return of(tmp);
  }

  check(chartNode: ChartNode) {
    chartNode.actived = !chartNode.actived;
    const tmp = [...this.uiNodes.cases, ...this.uiNodes.organizations, ...this.uiNodes.persons];
    const out = [];
    tmp.forEach(node => {
      if (node.actived) {
        out.push(node);
      }
    });
    console.log(out);
    this.outCheckedNodes.emit(out);
  }

  showItems(tag: string) {
    this.pointsTag = tag;
  }
}
