import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PastorPage } from './pastor';

@NgModule({
  declarations: [
    PastorPage,
  ],
  imports: [
    IonicPageModule.forChild(PastorPage),
  ],
})
export class PastorPageModule {}
