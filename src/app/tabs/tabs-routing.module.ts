import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DressDetailComponent } from '../components/dress-detail/dress-detail.component';
import { DressEditComponent } from '../components/dress-edit/dress-edit.component';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab2',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab2',
    pathMatch: 'full'
  },
  {
    path: 'detail/:id',
    component: DressDetailComponent,
  },
  {
    path: 'edit/:id',
    component: DressEditComponent,
  },
  {
    path: 'add',
    component: DressEditComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
