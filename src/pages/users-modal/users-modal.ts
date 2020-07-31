import { Component } from '@angular/core';
import { App,IonicPage, ViewController, ToastController, NavController, NavParams } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
/**
 * Generated class for the UsersModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-users-modal',
  templateUrl: 'users-modal.html',
})
export class UsersModalPage {

    public Users: Array<any>;
    public FetchUrl: string;
    public FetchPostdata: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
      private viewCtrl: ViewController, private app: App, private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
      this.FetchUrl = this.navParams.get("fetchurl");
      this.FetchPostdata = this.navParams.get("fetchpostdata");


      //fetch users
      this.presentLoading("please wait a sec");
      this.httpservice.postStuff(this.FetchUrl, JSON.stringify(this.FetchPostdata))
          .subscribe((data)=>{
              this.dismissLoad();
              if( data.results == "0"){
                  this.presentToast(data.message, 5000);
              }else{
                  this.Users = data.results;
              }
          },(err)=>{
              this.dismissLoad();
              this.presentToast(" Bad Connection or response", 5000);
          });
    console.log('ionViewDidLoad UsersModalPage');
  }

    //get more users;
    getMoreUsers(pgn){
        this.FetchPostdata.pgn = pgn;
        this.httpservice.postStuff(this.FetchUrl, JSON.stringify(this.FetchPostdata))
            .subscribe(()=>{},()=>{});
    }

    pushPage(str: string, navparams: any){
        this.viewCtrl.dismiss();
        /*nav push keeps all nav pages on the overlay so app rootnav uses root nav obj -- ugonna say so*/
        this.app.getRootNav().push(str,navparams);
        /*let nav = this.navCtrl.getActive()
        nav.push(str,navparams);*/
    }

    dismissModal(){
        this.viewCtrl.dismiss();
    }


    //using spinners as loading detectors;
    public LoadingMessage: string;
    public DisplaySpinner: boolean;

    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }
    public hosturl: string = this.httpservice.hostdomain;
    dismissLoad(){
        this.DisplaySpinner = false;
    }

    presentToast(message, duration){
        let toast = this.toastCtrl.create({
            "message":message,
            "position":"middle",
            "duration": duration
        });
        toast.present();

    }
}
