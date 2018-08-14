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

/**
 * 页面展示用数据结构
 *
 * @interface UInodes
 */
interface UInodes {
  persons: ChartNode[];
  cases: ChartNode[];
  organizations: ChartNode[];
}

/**
 * 可显示隐藏的节点tag
 *
 * @enum {number}
 */
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
  show: boolean; // 控制下拉是否显示
  pointsTag = 'organization'; // 下拉公司与事件的切换
  uiNodes: UInodes; // 下拉显示的各节点数据

  @Input()
  top: number;
  @Input()
  right: number;
  @Input()
  nodes: ChartNode[] = []; // 图表所有节点集合，只是带上了是否可以隐藏的tag

  /**
   * 返回了隐藏的点和需要显示的点，实际上外部只用了隐藏的点，这里保留为了以后作钩子
   *
   * @memberof CheckNodeComponent
   */
  @Output()
  outCheckedNodes = new EventEmitter<{ out: string[]; hidden: string[] }>();

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
    // 定位下拉框
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
        out.push(node.id);
      } else {
        hidden.push(node.id);
      }
    });
    this.outCheckedNodes.emit({
      out,
      hidden
    });
  }

  showItems(tag: string) {
    this.pointsTag = tag;
  }
}
