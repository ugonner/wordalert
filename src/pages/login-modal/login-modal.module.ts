import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginModalPage } from './login-modal';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';

@NgModule({
  declarations: [
    LoginModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginModalPage),
  ],
  providers: [
    HttpservicesProvider
  ]
})
export class LoginModalPageModule {}
