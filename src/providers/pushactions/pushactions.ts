import { Injectable } from '@angular/core';
import { HttpservicesProvider } from '../httpservices/httpservices'
import { PrayerservicesProvider } from '../prayerservices/prayerservices'
import { FCM } from '@ionic-native/fcm'
import { Storage } from '@ionic/storage';
/*
  Generated class for the PushactionsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushactionsProvider {

  constructor(public httpservice: HttpservicesProvider, private prayerservice: PrayerservicesProvider, private fcm: FCM,
      private storage: Storage) {
    console.log('Hello PushactionsProvider Provider');
  }


    presentToast(str: string, duration: number){
        this.prayerservice.presentToast(str,duration);
    }


    getFCMToken(){
        return this.fcm.getToken()
    }

    pushIt(){

        this.fcm.onNotification().subscribe(data=>{
            if(data.wasTapped){
                console.log("Received in background");
            } else {
                console.log("Received in foreground");
            }
        }, (err)=>{
            this.presentToast(err + 'on refresh', 5000);
        });

        this.fcm.onTokenRefresh().subscribe(token=>{
            this.updatePushId(token);
        }, (err)=>{
            this.presentToast(err + 'on refresh', 5000);
        });
    }


    updatePushId(pushid){
        let postdata: any = {};
        let useremail: any;
        this.storage.get('bibleappuserdata')
            .then((userdata)=>{
                if(userdata){
                    useremail = userdata.email;
                    postdata = {
                        updatepushid: 'yes',
                        pushid: pushid,
                        useremail: useremail
                    };
                }else{
                    postdata = {
                        updatepushid: 'yes',
                        pushid: pushid
                    };
                }

                this.httpservice.postStuff("/api/user/index.php", JSON.stringify(postdata))
                    .subscribe((data)=>{
                        console.log(JSON.stringify(data));
                    },(err)=>{
                        this.presentToast(JSON.stringify(err)+ 'no update of pushid', 5000);
                    })

            }).catch((userdataerr)=>{
                this.presentToast("unable to access device data"+ userdataerr, 5000)
            })

    }

    pushIt2(){

// to check if we have permission
        /*this.push.hasPermission()
            .then((res: any) => {

                if (res.isEnabled) {
                    console.log('We have permission to send push notifications');
                } else {
                    this.presentToast('We do not have permission to send push notifications',5000)
                }

            }).catch((err) =>{
                this.presentToast(JSON.stringify(err)+ 'on permission', 5000);
            });


         // Create a channel (Android O and above). You'll need to provide the id, description and importance properties.
         this.push.createChannel({
         id: "testchannel1",
         description: "My first test channel",
         // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
         importance: 3
         }).then(() => console.log('Channel created'));

         // Delete a channel (Android O and above)
         this.push.deleteChannel('testchannel1').then(() => console.log('Channel deleted'));

         // Return a list of currently configured channels
         this.push.listChannels().then((channels) => console.log('List of channels', channels))
         */

// to initialize push notifications
        /*const options: PushOptions = [
            {
                android: {
                    senderid: 646390458976
                }
            },
            {
                ios: {
                    alert: 'true',
                    badge: true,
                    sound: 'false'
                }
            },
            {
                windows: {}
            },
            {
                browser: {
                    pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                }
            }

        ];

        const pushObject: PushObject = this.push.init(options);
        pushObject.on('notification')
            .subscribe((notification: any) => {
                console.log('Received a notification', notification)
            }, (err) =>{
                this.presentToast(JSON.stringify(err)+ 'on push notification', 5000);
            });

        pushObject.on('registration')
            .subscribe((registration: any) => {
                this.presentToast('Device registered'+ registration.registrationId , 5000);
                this.updatePushId(registration.registrationId);
            }, (err) =>{
                this.presentToast(JSON.stringify(err)+ 'on push registration', 5000);
            });


        pushObject.on('error').subscribe(error => {
            console.error('Error with Push plugin', error)
        }, (err) =>{
            this.presentToast(JSON.stringify(err)+ 'on push error', 5000);
        });*/
    }

}
