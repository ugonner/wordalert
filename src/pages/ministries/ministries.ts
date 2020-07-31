import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, NavParams } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
/**
 * Generated class for the MinistriesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ministries',
  templateUrl: 'ministries.html',
})
export class MinistriesPage {
  public Ministries: Array<any>;
  public IsAdmin: boolean;
  public MinistryName: string;
    public MinistryAddress: string;
    public MinistryAbout: string;
    public MinistryOverseerid: string;
  public DisplayCreateMinistryForm: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
      private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    this.presentLoading("getting ministries");
    this.httpservice.postStuff("/api/ministry/index.php", JSON.stringify({getministries: "yes"}))
        .subscribe((data)=>{
            this.dismissLoad();
            if(data.results == "0"){
                this.presentToast(data.message, 5000);
            }else{
                this.Ministries = data.results;
            }
        },(err)=>{
            this.dismissLoad();
            this.presentToast(" Bad Connection or response", 5000);
        });
    console.log('ionViewDidLoad MinistriesPage');
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

    //create ministry;

    createMinistry() {
        if(this.MinistryName == "" || this.MinistryName == null || this.MinistryAddress == "" || this.MinistryAddress == null){
            this.presentToast("Looks like you did not put ministry name or address", 5000);
            return false;
        }
        let postdata = {
            addministry: "yes",
            ministryname: this.MinistryName,
            ministryaddress: this.MinistryAddress,
            ministryoverseerid: this.MinistryOverseerid,
            ministryabout: this.MinistryAbout
        };
        this.presentLoading("getting ministries");
        this.httpservice.postStuff("/api/ministry/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);
                }else{
                    this.presentToast(data.message, 5000);
                    let newministry = {
                        ministryid: 1,
                        ministryname: this.MinistryName
                    };
                    this.Ministries.splice(0,0,newministry);
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            });
        return true;
    }


    //push page; navigation;
    pushPage(str: string, navparams: any){
        this.navCtrl.push(str,navparams);
    }

    displayCreateMinistryForm(){
        this.DisplayCreateMinistryForm = !this.DisplayCreateMinistryForm;
    }

    //track ministries displayed at DOM;
    trackMinistries(index, item){
        return item.id;
    }

}
