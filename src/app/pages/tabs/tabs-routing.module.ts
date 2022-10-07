import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
          },
          {
            path: 'photo-detail/:id',
            loadChildren: () => import('../photo-detail/photo-detail.module').then(m => m.PhotoDetailPageModule)
          },
          {
            path: 'photo-edit/:id',
            loadChildren: () => import('../photo-edit/photo-edit.module').then(m => m.PhotoEditPageModule)
          },
          {
            path: 'photo-add',
            loadChildren: () => import('../photo-edit/photo-edit.module').then(m => m.PhotoEditPageModule)
          },
        ],
      },
      {
        path: '',
        redirectTo: '/app/tabs/tab2',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/app/tabs/tab2',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
