// import { ErrorComponent } from './error/error.component';
import { LayoutComponent } from './share/components/layout/layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';



const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        // component: HomeComponent
      },
      {
        path: 'core',
        loadChildren: './module-core/core.module#CoreModule'
      },
      {
        path: 'base',
        loadChildren: './module-base/base.module#BaseModule'
      },
      {
        path: 'warehouse',
        loadChildren: './module-warehouse/warehouse.module#WarehouseModule'
      },
      {
        path: 'purchase',
        loadChildren: './module-purchase/purchase.module#PurchaseModule'
      },
      {
        path: 'sales',
        loadChildren: './module-sales/sales.module#SalesModule'
      },
      {
        path: 'finance',
        loadChildren: './module-finance/finance.module#FinanceModule'
      },
      {
        path: 'plan',
        loadChildren: './module-plan/plan.module#PlanModule'
      }
    ]
  },
  {
    path: 'error', // 用来展示404等错误页面
    // component: ErrorComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    // component: ErrorComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
