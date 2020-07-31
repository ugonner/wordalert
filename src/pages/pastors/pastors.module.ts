import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PastorsPage } from './pastors';

@NgModule({
  declarations: [
    PastorsPage,
  ],
  imports: [
    IonicPageModule.forChild(PastorsPage),
  ],
})
export class PastorsPageModule {}
