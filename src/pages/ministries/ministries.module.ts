import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MinistriesPage } from './ministries';

@NgModule({
  declarations: [
    MinistriesPage,
  ],
  imports: [
    IonicPageModule.forChild(MinistriesPage),
  ],
})
export class MinistriesPageModule {}
