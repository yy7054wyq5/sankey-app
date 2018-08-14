import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  AfterViewInit,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChartNode } from '../../../share/components/chart/chart.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

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
export class CheckNodeComponent implements OnInit, OnChanges, AfterViewInit {
  show: boolean;
  pointsTag = 'organization';
  uiNodes: UInodes;

  @Input()
  top: number;
  @Input()
  right: number;
  @Input()
  searchBar: SearchBarComponent;
  @Input()
  nodes: ChartNode[] = [];
  @Output()
  outCheckedNodes = new EventEmitter<{ out: ChartNode[]; hidden: ChartNode[] }>();

  constructor(private _element: ElementRef, private _render: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes && !changes.nodes.isFirstChange()) {
      this._creatData(this.nodes).subscribe(data => (this.uiNodes = data));
    }
  }

  ngOnInit() {
    console.log(this.nodes);
    this._creatData(this.nodes).subscribe(data => (this.uiNodes = data));
  }

  ngAfterViewInit() {
    this._render.setAttribute(this._element.nativeElement, 'style', `top: ${this.top}rem;right: ${this.right}rem; position: absolute;`);
  }

  ////////////////////////////////////
  /**
   * 创建下拉数据
   *
   * @private
   * @param {ChartNode[]} data
   * @returns {Observable<UInodes>}
   * @memberof CheckNodeComponent
   */
  private _creatData(data: ChartNode[]): Observable<UInodes> {
    const tmp: UInodes = {
      cases: [],
      persons: [],
      organizations: []
    };
    data.forEach(node => {
      node.actived = true;
      if (node.id) {
        if (node.id.indexOf(Tag.case) > -1) {
          tmp.cases.push(node);
        } else if (node.id.indexOf(Tag.organization) > -1) {
          tmp.organizations.push(node);
        } else {
          tmp.persons.push(node);
        }
      }
    });
    return of(tmp);
  }

  /**
   * 勾选节点
   *
   * @param {ChartNode} chartNode
   * @memberof CheckNodeComponent
   */
  check(chartNode: ChartNode) {
    chartNode.actived = !chartNode.actived;
    const tmp = [...this.uiNodes.cases, ...this.uiNodes.organizations, ...this.uiNodes.persons];
    const out = [];
    const hidden = [];
    tmp.forEach(node => {
      if (node.actived) {
        out.push(node);
      } else {
        hidden.push(node.id);
      }
    });
    console.log(out);
    this.outCheckedNodes.emit({
      out,
      hidden
    });
  }

  showItems(tag: string) {
    this.pointsTag = tag;
  }
}
