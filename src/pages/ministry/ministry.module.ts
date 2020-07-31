import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MinistryPage } from './ministry';

@NgModule({
  declarations: [
    MinistryPage,
  ],
  imports: [
    IonicPageModule.forChild(MinistryPage),
  ],
})
export class MinistryPageModule {}
