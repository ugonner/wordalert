import { Component } from '@angular/core';
import { IonicPage,AlertController, ToastController, NavController, NavParams } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { TextToSpeech } from '@ionic-native/text-to-speech';

/**
 * Generated class for the AlarmlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-alarmlist',
  templateUrl: 'alarmlist.html',
})
export class AlarmlistPage {
  public AlarmList: any = [];
  public ErrMessage: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private lnotification: LocalNotifications,
      private alertCtrl: AlertController, private toastCtrl: ToastController, private tts: TextToSpeech) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmlistPage');
  }
    ionViewDidEnter() {
        this.lnotification.getAll()
            .then((nots)=>{

                if(nots.length > 0){
                    nots.forEach((notif)=>{
                        notif.data = JSON.parse(notif.data);
                    });
                    this.AlarmList = nots;
                }
            }).catch((getallnotserr)=>{
                console.log("unable to get nots");
                /*alert(JSON.stringify(getallnotserr) + " unable to get all notifications at all");*/
            });
    }

    clearAllWordAlerts(){
        let alert = this.alertCtrl.create({
            "title": "Confirm Delete",
            "message": "Are you sure you want to delete all your word alerts ?",
            "buttons":[
                {
                    "text": "Ya",
                    "handler":()=>{
                        this.lnotification.cancelAll()
                            .then((data)=>{
                                this.AlarmList = [];
                                let toast = this.toastCtrl.create({
                                    "message": "ALL Word alerts successfully deleted",
                                    "duration": 5000,
                                    "position": "middle"
                                });
                                toast.present();

                            }).catch((clearerr)=>{
                                let toast = this.toastCtrl.create({
                                    "message": JSON.stringify(clearerr)+ " unable to clear all word alerts",
                                    "duration": 7000,
                                    "position": "middle"
                                });
                                toast.present();
                            });
                        return true;
                    }
                },
                {
                    "text": "No",
                    "handler":()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }

    clearWordAlert(nid, listindex){
        let alert = this.alertCtrl.create({
            "title": "Confirm Delete",
            "message": "Are you sure you want to delete this word alert ?",
            "buttons":[
                {
                    "text": "Ya",
                    "handler":()=>{
                        this.lnotification.cancel(nid)
                            .then((data)=>{
                                this.AlarmList.splice(listindex, 1);
                                let toast = this.toastCtrl.create({
                                    "message": "Word alert successfully deleted",
                                    "duration": 5000,
                                    "position": "middle"
                                });
                                toast.present();

                            })
                            .catch((clearerr)=>{
                                let toast = this.toastCtrl.create({
                                    "message": JSON.stringify(clearerr)+ " unable to clear this word alerts",
                                    "duration": 7000,
                                    "position": "middle"
                                });
                                toast.present();
                            });
                        return true;
                    }
                },
                {
                    "text": "No",
                    "handler":()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }

    viewNotificationText(ListIndex){
        let text = this.AlarmList[ListIndex].data.AlarmText;
        let alert = this.alertCtrl.create({
            title: "Text Content",
            message: text,
            buttons: [
                {
                    text: "Seen",
                    handler: ()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }


    listenNotificationText(ListIndex){
        let Notificationtext = this.AlarmList[ListIndex].data.AlarmText;

        this.tts.speak({
            text: Notificationtext,
            rate: 0.6
        }).then((spoke)=>{
            console.log('spoke');
        })
        .catch((speakerr)=>{
                this.ErrMessage = JSON.stringify(speakerr);
        });

        let alert = this.alertCtrl.create({
            title: "Text Content",
            message: Notificationtext,
            buttons: [
                {
                    text: "Seen",
                    handler: ()=>{
                        return true;
                    }
                },
                {
                    text: "Shut Up",
                    handler: ()=>{
                        this.tts.stop()
                            .then(()=>{})
                            .catch((stoperr)=>{
                                this.ErrMessage = JSON.stringify(stoperr);
                            });
                        return true;
                    }
                }
            ]
        });
        alert.present();


    }
//track notifications displayed at DOM;
    tracknotifications(index, item){
        return item.id;
    }
}
