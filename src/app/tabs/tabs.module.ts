import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { DressDetailComponent } from '../components/dress-detail/dress-detail.component';
import { DressEditComponent } from '../components/dress-edit/dress-edit.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
  ],
  declarations: [TabsPage, DressDetailComponent, DressEditComponent]
})
export class TabsPageModule {}
