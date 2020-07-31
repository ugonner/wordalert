import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlarmlistPage } from './alarmlist';

@NgModule({
  declarations: [
    AlarmlistPage,
  ],
  imports: [
    IonicPageModule.forChild(AlarmlistPage),
  ],
})
export class AlarmlistPageModule {}
