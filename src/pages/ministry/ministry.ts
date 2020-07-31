import { Component } from '@angular/core';
import { IonicPage, ToastController,  NavController, NavParams } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the MinistryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ministry',
  templateUrl: 'ministry.html',
})
export class MinistryPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
            private toastCtrl: ToastController, private storage: Storage) {
  }

    public Ministry: any = {};
    public IsAdmin: boolean;

  ionViewDidLoad() {
    //get minin=sy;
   let postdata = {
       getministry: "yes",
       ministryid: this.navParams.get("ministryid")
   };

   this.presentLoading("fetching Ministry details, please wait");
   this.httpservice.postStuff("/api/ministry/index.php", JSON.stringify(postdata))
       .subscribe((data)=>{
           this.dismissLoad();
           let results = data.results;
           if(results == "0"){
               this.presentToast(data.message, 5000);
           }else{
               //get userdata to check if isadmin;
               this.storage.get("bibleappuserdata")
                   .then((userdata)=>{
                       if(userdata.id == results[0].overseerid){
                           this.IsAdmin = true;
                       }
                   }).catch((userdataerr)=>{
                       console.log(userdataerr);
                   });
               this.Ministry = results[0];
               /*results = results[0];
               this.Ministry.set("ministryname", results.ministryname);
               this.Ministry.set("address", results.address);
               this.Ministry.set("about", results.about);
               this.Ministry.set("overseerid", results.overseerid);
               this.Ministry.set("firstname", results.firstname);
               this.Ministry.set("surname", results.surname);*/
           }
       },(err)=>{
           this.dismissLoad();
           this.presentToast(" Bad Connection or response",5000);
       });
    console.log('ionViewDidLoad MinistryPage');
  }

    DisplayEditForms: boolean = false;
    toggleDisplayEditForms(){
        this.DisplayEditForms = !this.DisplayEditForms;
    }

    //edit ministry info;
    editMinistry(pty,val){
        let postdata = {
            editministry: "yes",
            ministryid: this.Ministry.ministryid,
            property: pty,
            value: val
        };

        this.presentLoading("editing ministry info");
        this.httpservice.postStuff("/api/ministry/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);
                }else{
                    this.presentToast(data.message, 5000);
                }
            },(err)=>{
                this.presentToast(" Bad Connection or response", 5000);
            },()=>{})
    }

    //using spinners as loading detectors;
    public DisplaySpinner: boolean;
    public LoadingMessage: string;
    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }
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

    pushPage(str: string, navparams: any){
        this.navCtrl.push(str,navparams);
    }
}
