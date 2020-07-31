import { Injectable } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../httpservices/httpservices'
import { Storage } from '@ionic/storage';

/*
  Generated class for the PrayerservicesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PrayerservicesProvider {

    public Prayers;
    public User: any;
  constructor(public httpservice: HttpservicesProvider, private storage: Storage, private alertCtrl: AlertController,
      private toastCtrl: ToastController) {

     this.userRoleAndFunction();
    console.log('Hello PrayerservicesProvider Provider');
  }


    userRoleAndFunction(){
        this.storage.get('bibleappuserdata')
            .then((userdata)=>{
                if(userdata){
                    this.User = userdata;
                    let isPastor: boolean, isAdmin: boolean;
                    if(userdata.roleid == 1){
                       isPastor = true;
                    }
                    if(userdata.functionid == 1){
                        isAdmin = true;
                    }
                    let User = {
                        isPastor: isPastor,
                        isAdmin: isAdmin
                    };
                    return User;
                }else{
                    return false;
                }
            }).catch((userdataerr)=>{
                alert("unable to get access to storage");
            });
    }

    joinPrayer(prayerid, ownerid, prayertext, index): boolean{

        //check if user is a pastor;
        if(this.User.roleid == 1){
            let alert = this.alertCtrl.create({
                subTitle: "Prayer Text",
                message: "Speak your word on this person's prayer request",
                inputs: [{
                    name: "prayertext",
                    type: "textarea",
                    label: "prayer text",
                    placeholder: "enter prayer text"
                }],
                buttons: [{
                    text: "Join, With My Word",
                    handler: (data)=>{
                        return this.joinPrayer2(prayerid,ownerid,data.prayertext,index);
                    }
                },
                    {
                        text: "Join, Without Word",
                        handler: ()=>{
                            return this.joinPrayer2(prayerid,ownerid,prayertext,index);
                        }
                    },
                    {
                        text: "Never Mind",
                        handler: ()=>{
                            return true;
                        }
                    }

                ]

            });
            alert.present();
        }else{
            this.joinPrayer2(prayerid,ownerid,prayertext,index);

        }
        return true;
    }



    //join in prayer;
    joinPrayer2(prayerid: number, ownerid: number, prayertext: any, index: number){

        let postdata = {
            joinprayer:"yes",
            prayerid: prayerid,
            ownerid: ownerid,
            prayeractiontext: prayertext,
            actiontypeid: 1
        };


        this.presentLoading("processing");
        this.httpservice.postStuff("/api/prayer/index.php", postdata)
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);
                    return false;
                }else{
                    return true;
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(JSON.stringify(err), 5000);
                return false;
            })
    }



    //renege from prayer;
    leavePrayer(prayerid, index: number): boolean{
        let postdata = {
            leaveprayer: "yes",
            prayerid: prayerid,
        };

        this.presentLoading("please wait a sec");
        this.httpservice.postStuff("/api/prayer/index.php", postdata)
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);
                    return false;
                }else{
                    return true;
                }

            },(err)=>{
                this.dismissLoad();
                this.presentToast(JSON.stringify(err), 5000);
                return false;
            })
        return true;
    }

    //using spinners as loading detectors;
    public LoadingMessage: string;
    public DisplaySpinner: boolean;

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
}
