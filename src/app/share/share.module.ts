import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components/layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ErrorComponent } from './components/error/error.component';
import { RouterModule } from '@angular/router';
import { ChartComponent } from './components/chart/chart.component';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
import { CheckNodeComponent } from './components/check-node/check-node.component';

@NgModule({
  imports: [RouterModule, CommonModule, HttpClientModule, NgZorroAntdModule],
  declarations: [LayoutComponent, ErrorComponent, ChartComponent, SafeHtmlPipe, CheckNodeComponent],
  providers: [SafeHtmlPipe],
  exports: [ChartComponent, SafeHtmlPipe, CheckNodeComponent]
})
export class ShareModule {}
