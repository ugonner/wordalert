import { Component, ViewChild } from '@angular/core';


/*providers, injectables*/
import { Platform, PopoverController, AlertController, ToastController, Nav,MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpservicesProvider } from '../providers/httpservices/httpservices';
import { PushactionsProvider } from '../providers/pushactions/pushactions';
import { Storage } from '@ionic/storage';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { TextToSpeech, TTSOptions } from '@ionic-native/text-to-speech';
/*import { FCM } from '@ionic-native/fcm';*/

/*import { Push, PushObject, PushOptions } from '@ionic-native/push';*/

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  public rootPage:any = "MainpagePage";
  public bibleappfirstname = "Guest";
  public LoggedOut: boolean = true;

    constructor(public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
              private httpservice: HttpservicesProvider, private storage: Storage, private menuCtrl: MenuController,
      private tts: TextToSpeech, private lnotification: LocalNotifications, private alertCtrl: AlertController,
      private toastCtrl: ToastController, private popoverCtrl: PopoverController, private pushservice: PushactionsProvider) {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.


        this.lnotification.on("click", (notification,status)=>{
            let ttsoptions: TTSOptions = {
                "text": JSON.parse(notification.data).AlarmText,
                "locale": 'en-US',
                "rate": 0.8
            };
            this.tts.speak(ttsoptions)
                .then(()=>{
                    console.log("it spoke tts worked");
                })
                .catch((ttserr)=>{
                    alert(JSON.stringify(ttserr) +" jp"+JSON.parse(notification.data).AlarmText+" "+ notification.data + "status is"+status+ "didnt speak");
                });
            this.rootPage = "AlarmlistPage";
        });

        this.pushservice.pushIt();
      statusBar.styleDefault();
      splashScreen.hide();

    });
  }

    private userdata: any;
    @ViewChild("nav1") public nav: Nav;
    public UserImage: String = "http://localhost/bona/img/iconic/img/suitmen.jpg";



    ngAfterViewInit(){
        this.loginUser();
    }

    loginUser(){
        this.storage.get("bibleappuserdata")
            .then(data =>{
                if(data.email){
                    let postdata: any = {
                        LoginFromLocalStorage:' ',
                        log:' ',
                        login: ' ',
                        email: data.email,
                        password: data.password
                    };

                    //thinking of reeplace with fcm;
                    this.pushservice.getFCMToken()
                        .then((token)=>{
                            postdata.pushid = token;
                            this.login(postdata);
                            this.bibleappfirstname = data.firstname;
                        }).catch((fcmerror=>{
                            this.login(postdata);
                            this.bibleappfirstname = data.firstname;
                            /*this.presentToast("fcm error"+ fcmerror, 5000)*/

                        }))

                }else{
                    console.log("no userdata email found");
                    this.signInModal();
                }
            })
            .catch(err => {
                console.log(err + "no userdata found at all");
                this.signInModal();
            });
    }

    login(postdata){
        this.httpservice.postStuffRawOutput("/api/user/index.php", JSON.stringify(postdata))
            .subscribe(res=>{
                if(res.results == "0"){
                    this.signInModal();
                    console.log(" not logged in ")
                }else{
                    this.LoggedOut = false;
                    console.log('login successful');
                    return true;
                }
            },err=>{
                /*this.presentToast(err+'not login really', 5000);*/
                this.signInModal();
                console.log(err);
                return false;
            });
    }

    logOutUser(){
        let alert = this.alertCtrl.create({
            title: "Notice:",
            message: "When you log out, data stored on this device for this application will be cleared eg all word-alerts , Do you wish to continue ?",
            buttons: [
                {
                    text: "Yes",
                    handler: ()=>{
                        return this.logOut();
                    }
                },
                {
                    text: "Cancel",
                    handler: ()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }

    presentToast(str,duration){
        let toast = this.toastCtrl.create({
            message: str,
            position: "middle"
        });
        toast.present();
    }


    logOut(){
        this.userdata = this.storage.get("bibleappuserdata")
            .then(userdata =>{
                let userid = userdata.id
                if(userid){
                    console.log( userdata.email + "userdata found on device");
                    //log out;
                    let postdata = {
                        "log":' ', "logout": '',"userid":userid
                    };
                    this.httpservice.postStuff("/api/user/index.php",postdata)
                        .subscribe(res=>{
                            if(res.results == "0"){
                                this.storage.remove("bibleappuserdata")
                                    .then(data => {
                                        this.bibleappfirstname = "Guest";
                                        this.storage.remove("userpastors")
                                            .then(()=>{
                                                this.storage.remove("usergroups")
                                                    .then(()=>{
                                                        this.storage.remove("userprayers")
                                                            .then(()=>{
                                                                console.log("user prayers cleared");
                                                            }).catch(()=>{
                                                                console.log("unable to clear userprayers");
                                                            })
                                                        console.log("user prayers cleared");
                                                    }).catch(()=>{
                                                        console.log("unable to clear userprayergroup");
                                                    })
                                            }).catch(()=>{
                                                console.log("unable to clear user pastor")
                                            })
                                        console.log("device data cleared");
                                    })
                                    .catch(err=>{
                                        console.log( err + " device data not cleared");
                                    });

                                //clear notifications
                                this.lnotification.cancelAll()
                                    .then(()=>{
                                        /*this.presentToast("All word alerts cleared", 5000);*/
                                        console.log("All word alerts cleared");
                                    }).catch((noterr)=>{
                                        console.log("unable to clear notifications"+JSON.stringify(noterr) );
                                    });
                                this.bibleappfirstname = "Guest";
                                this.LoggedOut = true;
                                this.nav.push("MainpagePage");

                            }else{
                                console.log("logout not effected "+ res.message + ' '+res.results );
                            }

                        }, err=>{
                            console.log(err + "no connect"+ err);
                        });
                }
            })
            .catch(err =>{
                console.log("no userdata found on device " + err);
            })
    }

    signInModal(){
        let mod = this.popoverCtrl.create("LoginModalPage");
        mod.present();
    }

    //push;
    pushPage(PageString: String){
        this.menuCtrl.getOpen().close();
        this.nav.push(PageString);
    }

    pushPageWithParams(PageString: String , Params: any){
        this.menuCtrl.getOpen().close();
        this.nav.push(PageString,Params);
    }


}

