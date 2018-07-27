import { LayoutComponent } from './share/components/layout/layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './share/components/error/error.component';
import { HomeComponent } from './home/home.component';


const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },

    ]
  },
  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true
    })
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
