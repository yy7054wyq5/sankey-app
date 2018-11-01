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
import { ChartNode } from '../../../share/components/chart/chart.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NodeCate } from '../../services/common/common.service';

export class CheckTab {
  tag: string;
  title: string;
  checkboxColor: string;
  options: CheckOption[];
  constructor(tag: string, title: string, checkboxColor: string) {
    this.tag = tag;
    this.title = title;
    this.checkboxColor = checkboxColor;
    this.options = [];
  }
}

export interface CheckOption extends ChartNode {
  actived: boolean;
}

@Component({
  selector: 'app-check-node',
  templateUrl: './check-node.component.html',
  styleUrls: ['./check-node.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CheckNodeComponent implements OnInit, OnChanges, AfterViewInit {
  show: boolean; // 控制下拉是否显示
  pointsTag: string; // 下拉公司与事件的切换


  @Input()
  top: number;
  @Input()
  right: number;
  @Input()
  display: string;
  @Input()
  marginTop: string;
  @Input()
  tabs: CheckTab[];
  @Input()
  positionType: 'absolute' | 'relative' | 'fixed' | null = 'absolute';
  @Input()
  placeholder: string;
  @Input()
  outFullData = false;

  /**
   * 返回了隐藏的点和需要显示的点，实际上外部只用了隐藏的点，这里保留为了以后作钩子
   *
   * @memberof CheckNodeComponent
   */
  @Output()
  outCheckedNodes = new EventEmitter<{ out: string[]; hidden: string[] }>();

  constructor(private _element: ElementRef, private _render: Renderer2, private safe: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.tabs && !changes.tabs.isFirstChange()) {
        this.pointsTag = this.tabs.length ? this.tabs[0].tag : '';
        console.log(this.pointsTag);
      }

      if (changes.positionType) {
        this._positionDiv(this.positionType);
      }
    }
    // console.log(this.tabs);
  }

  ngOnInit() {
    this.pointsTag = this.tabs[0].tag;
    // console.log(this.nodes);
    // console.log(this.tabs, this.tabs[0].tag);
  }

  ngAfterViewInit() {
    this._positionDiv(this.positionType);
  }

  ////////////////////////////////////

  private _positionDiv(positionType) {
    // 定位下拉框
    this._render.setAttribute(
      this._element.nativeElement,
      'style',
      `top: ${this.top}rem;right: ${this.right}rem; position: ${positionType};display:${this.display};margin-top:${this.marginTop}`
    );
  }

  /**
   * 选中样式
   *
   * @param {CheckOption} checkOption
   * @param {string} color
   * @returns
   * @memberof CheckNodeComponent
   */
  optionActiveStyle(checkOption: CheckOption, tab: CheckTab, tag: NodeCate) {
    let color = '#717a88';
    if (checkOption.actived && tab.tag === tag) {
      color = tab.checkboxColor;
    }
    return this.safe.bypassSecurityTrustStyle(`border-color: ${color};color: ${color};`);
  }

  /**
   * option显示文字
   *
   * @param {CheckOption} option
   * @returns
   * @memberof CheckNodeComponent
   */
  disName(option: CheckOption) {
    if (option.contact !== undefined && option.line !== undefined) {
      // return `${option.contact}度_${option.line} ${option.name}`;
      return option.name;
    }
    return option.name;
  }

  /**
   * 勾选节点
   *
   * @param {checkOption} chartNode
   * @memberof CheckNodeComponent
   */
  check(checkOption: CheckOption) {
    checkOption.actived = !checkOption.actived;
    let tmp = [];
    this.tabs.forEach(tab => {
      tmp = tmp.concat(tab.options);
    });
    const out = [];
    const hidden = [];
    tmp.forEach((node: CheckOption) => {
      if (node.actived && node.canHidden) {
        out.push(this.outFullData ? node : node.id);
      } else {
        hidden.push(this.outFullData ? node : node.id);
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
