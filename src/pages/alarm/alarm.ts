import { Component, ViewChild } from '@angular/core';
import { App,Slides,ToastController,IonicPage, NavController,MenuController, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { TextToSpeech, TTSOptions } from '@ionic-native/text-to-speech';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the AlarmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html',
})
export class AlarmPage{


    public AlarmMenu: Boolean = true;
    public AlarmHour: any = "00";
    public AlarmMin: any = "00";
    public AlarmAm: any = "Am";
    public AlarmTime: any;
    public ClassMessage: String;
    public SuccessIconDisplay = true;
    public ErrorIconDisplay = true;
    public DisplaySetAlarmForm: boolean = false;
    public DisplayQuotationForm: boolean;
    public AlarmType: String;
    public AlarmText: string;


    //activate segment button on slide change;
    public PastorsSlideButton;
    public PrayergroupSlideButton;
    public PersonalSlideButton: any = "activebutton";
    public SlideName: string = "Personal Alert Text";
    public UserPrayerGroups: Array<any>;
    public UserPastors: Array<any>;
    public ErrMessage: string;
    public PrayerGroupId: any;
    public PastorId: any;

  constructor(public navCtrl: NavController, public menuCtrl: MenuController, private toastCtrl: ToastController,
      private httpservice: HttpservicesProvider, private alertCtrl: AlertController,
      private lnotification: LocalNotifications, private tts: TextToSpeech, private storage: Storage) {
  }


    @ViewChild("slides")slider: Slides;


    slideToContent(index){
        this.slider.slideTo(index);
    }

    toggleAlarmForm(){
        this.DisplaySetAlarmForm = !this.DisplaySetAlarmForm;
    }



    public DisplaySpinner: boolean;
    public LoadingMessage: string;

    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }

    dismissLoad(){
        this.DisplaySpinner = false;
    }

    activateSegmentButton(){
        let SlideIndex = this.slider.getActiveIndex();
        if(SlideIndex == 1){
            this.SlideName = "Prayer-Group Alert Text";
            this.PrayergroupSlideButton = "activebutton";
            this.PersonalSlideButton = "";
            this.PastorsSlideButton = "";

            //get user's prayer groups
            this.presentLoading("trying to get your prayer groups");
            this.storage.get("usergroups")
                .then((grps)=>{
                    this.dismissLoad();
                    if(grps){
                        this.UserPrayerGroups = grps;
                    }else{
                        this.presentToast("You do not belong to any prayer group, join one to use their alert", 5000);
                    }
                }).catch((getgrpserr)=>{
                    this.presentToast("No prayer groups got, join one"+getgrpserr , 5000);
                })
        }else if(SlideIndex == 2){
            this.SlideName = "Pastor's Alert Text";
            this.PrayergroupSlideButton = "";
            this.PersonalSlideButton = "";
            this.PastorsSlideButton = "activebutton";


            //get user's pastors;
            this.presentLoading("trying to get your prayer groups");
            this.storage.get("userpastors")
                .then((psts)=>{
                    this.dismissLoad();
                    if(psts){
                        this.UserPastors = psts;
                    }else{
                        this.presentToast("You are not following any pastor, join one to use their alert", 5000);
                    }
                }).catch((getpstserr)=>{
                    this.presentToast("No pastors got, join one"+getpstserr , 5000);
                })
        }else{
            this.SlideName = "Personal Alert Text";
            this.PrayergroupSlideButton = "";
            this.PersonalSlideButton = "activebutton";
            this.PastorsSlideButton = "";
        }
    }

    //select alarmtype alarm;
    presentOptionsAlert(){
        this.DisplaySetAlarmForm = false;
        let alert = this.alertCtrl.create({
            "title": "Choose Alarm Type",
            "message": "Choose Quotation to get your alarm message from a bible quotation Or use word proclamation",
            "buttons":[
                {
                    "text": "Proclamation",
                    "handler":()=>{
                        this.DisplayQuotationForm = false;
                        this.AlarmType = "Proclamation";
                        return true;
                    }
                },
                {
                    "text": "Quotation",
                    "handler":()=>{
                            this.DisplayQuotationForm = true;
                            this.AlarmType = "Quotation";
                            return true;
                            }
                }
                ],
            cssClass: "overlays"
        });
        alert.present();
    }
public QuotationBook: any;
    public QuotationChapter: any = 1;
    public QuotationVerse1: any = 1;
    public QuotationVerse2: any = 0;
    public AlarmTitle: string;

    presentToast(message, duration){
        let toast = this.toastCtrl.create({
            "message":message,
            "position":"middle",
            "duration": duration
        });
        toast.present();

    }

    //set alarm;
    setPersonalAlarm(){
     if(this.AlarmHour == null || this.AlarmHour == "00" || this.AlarmMin == null){
         this.presentToast("Please set your alert time", 5000);
     }else{
        if(this.AlarmAm == "Pm" ){
            if(this.AlarmHour != 12 ){
                this.AlarmHour = (parseInt(this.AlarmHour) + 12).toString();
            }
        }else{
            if(this.AlarmHour == 12 ){
                this.AlarmHour = "00";
            }
        }

        this.AlarmTime = this.AlarmHour + this.AlarmMin;
        if(this.AlarmType == "Quotation"){
            if(this.QuotationBook == null){
                this.QuotationBook = "Genesis";
            }
            let quotation:any;
            if(this.QuotationVerse2 == 0){
                quotation = this.QuotationBook + "+" + this.QuotationChapter + ":"+ this.QuotationVerse1;
            }else{
                quotation = this.QuotationBook + "+" + this.QuotationChapter + ":"+ this.QuotationVerse1 +"-"+this.QuotationVerse2;
            }
            let apiuri = "/api/?passage="+quotation+"&type=json";
            this.presentLoading("getting your quotation, please wait");
            this.httpservice.getBibleQuotation(apiuri)
                .subscribe((res)=>{
                    let alarmtext:any = [];
                    for(let i = 0; i<res.length; i++){
                        alarmtext.push(res[i].text);
                    }
                    this.AlarmText = alarmtext.toString();
                    this.AlarmTitle = quotation;
                    console.log("successful fetch of quotation");
                    //save to notification;
                    let day = new Date();

                    this.lnotification.hasPermission()
                        .then((hasperm)=>{
                            if(!hasperm){
                                this.lnotification.registerPermission()
                                    .then((Rqst)=>{
                                        if(Rqst){
                                            console.log("permission granted");
                                        }else{
                                            alert("Permission to set alert denied"+ JSON.stringify(Rqst));
                                        }
                                    })
                                    .catch((Rqsterr)=>{
                                        alert("Permission to set alert denied"+ JSON.stringify(Rqsterr));
                                        console.log(JSON.stringify(Rqsterr))
                                    })
                            }
                            this.lnotification.schedule({
                                "id": this.AlarmTime,
                                "title": this.AlarmTitle,
                                "data": {"AlarmText": this.AlarmText, "author": "Me", "time": this.AlarmHour +":"+this.AlarmMin},
                                "firstAt": new Date(day.getFullYear(),day.getMonth(),day.getDate(),this.AlarmHour,this.AlarmMin,0,0),
                                "every": "day",
                                "sound": 'file://assets/notification.mp3'
                            });

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
                                let app: App;
                                app.getActiveNav().push("AlarmPage");
                            });

                            //display toast to confirm schedule;
                            this.presentToast("Word Alert Set Successfully for "+ this.AlarmTime, 5000);

                        })
                        .catch((haspermissionerr)=>{
                            this.presentToast(JSON.stringify(haspermissionerr + "at haspermision"),5000);
                            console.log(JSON.stringify(haspermissionerr))
                        });
                }, (err)=>{
                    this.presentToast(JSON.stringify(err) + "access err", 5000);
                });
            this.dismissLoad();

      }else{
//for proclamation alert;
            this.AlarmTitle = "My Proclamation";

        let day = new Date();

        this.lnotification.hasPermission()
                .then((hasperm)=>{
                    if(!hasperm){
                        this.lnotification.registerPermission()
                            .then((Rqst)=>{
                                if(Rqst){
                                    console.log("permission granted");
                                }else{
                                    this.presentToast("Permission to set alert denied"+ JSON.stringify(Rqst),4000);
                                }
                            })
                            .catch((Rqsterr)=>{
                                this.presentToast("Permission to set alert denied"+ JSON.stringify(Rqsterr),3000);
                                console.log(JSON.stringify(Rqsterr))
                            })
                    }
                        this.lnotification.schedule({
                            "id": this.AlarmTime,
                            "title": this.AlarmTitle,
                            "data": {"AlarmText": this.AlarmText, "author": "Me","time": this.AlarmTime},
                            "firstAt": new Date(day.getFullYear(),day.getMonth(),day.getDate(),this.AlarmHour,this.AlarmMin,0,0),
                            "every": "day",
                            "sound":"file://assets/notification.mp3"
                        });
                        this.lnotification.on("click", (notification,status)=>{
                            let ttsoptions: TTSOptions = {
                                "text": JSON.parse(notification.data).AlarmText,
                                "locale": 'en-US',
                                "rate": 0.6
                            };
                            this.tts.speak(ttsoptions)
                                .then(()=>{
                                    console.log("it spoke tts worked");
                                })
                                .catch((ttserr)=>{
                                    alert(JSON.stringify(ttserr) +" jp"+JSON.parse(notification.data).AlarmText+" "+ notification.data + "status is"+status+ "didnt speak");
                                });
                            let app: App;
                            app.getActiveNav().push("AlarmPage");
                        });

                    //display toast to confirm schedule;
                this.presentToast("Word Alert Set Successfully for "+ this.AlarmTime, 5000);

        })
        .catch((haspermissionerr)=>{
            this.presentToast(JSON.stringify(haspermissionerr + "at haspermision"),3000);
            console.log(JSON.stringify(haspermissionerr) + " couldnt check permission")
        });
        }
    }
}

    //set group alert;
    setPrayerGroupAlarm(){
        if(this.AlarmHour == null || this.AlarmHour == "00" || this.AlarmMin == null){
            this.presentToast("Please set your alert time", 5000);
        }else{
            if(this.AlarmAm == "Pm" ){
                if(this.AlarmHour != 12 ){
                    this.AlarmHour = (parseInt(this.AlarmHour) + 12);
                    if(this.AlarmHour > 24){
                        this.presentToast("please reset your alert time, current value is invalid", 5000);
                    }else{
                        this.AlarmHour = this.AlarmHour.toString();
                    }
                }
            }else{
                if(this.AlarmHour == 12 ){
                    this.AlarmHour = "00";
                }
            }

            this.AlarmTime = this.AlarmHour + this.AlarmMin;
            //formalt alarmtypeid
            let alarmtypeid;
            if(this.AlarmType == "Quotation"){
                alarmtypeid = 1;
            }else{
                alarmtypeid = 2;
            }
            //get alert text from server;
            let postdata = {
                getgroupalarmsByType: "yes",
                alarmtypeid: alarmtypeid,
                groupid: this.PrayerGroupId
            };
            this.presentLoading("please wait");
            this.httpservice.postStuff("/api/alarm/index.php",JSON.stringify(postdata))
                .subscribe((alarmfetch)=>{
                    let alarmdata = alarmfetch.results;
                    if(alarmdata == "0"){
                        this.presentToast(alarmfetch.message + " no", 5000);
                    }else{
                        let day = new Date();
                        this.lnotification.hasPermission()
                            .then((hasperm)=>{
                                if(!hasperm){
                                    this.lnotification.registerPermission()
                                        .then((Rqst)=>{
                                            if(Rqst){
                                                console.log("permission granted");
                                            }else{
                                                alert("Permission to set alert denied"+ JSON.stringify(Rqst));
                                            }
                                        })
                                        .catch((Rqsterr)=>{
                                            alert("Permission to set alert denied"+ JSON.stringify(Rqsterr));
                                            console.log(JSON.stringify(Rqsterr))
                                        })
                                }
                                this.lnotification.schedule({
                                    "id": this.AlarmTime,
                                    "title": alarmdata[0].title,
                                    "data": {"AlarmText": alarmdata[0].alarmtext, "author": alarmdata[0].groupname,"time": this.AlarmTime},
                                    "firstAt": new Date(day.getFullYear(),day.getMonth(),day.getDate(),this.AlarmHour,this.AlarmMin,0,0),
                                    "every": "day",
                                    sound:"file://assets/notification.mp3"
                                });
                                this.lnotification.on("click", (notification,status)=>{
                                    let ttsoptions: TTSOptions = {
                                        "text": JSON.parse(notification.data).AlarmText,
                                        "locale": 'en-US',
                                        "rate": 0.6
                                    };
                                    this.tts.speak(ttsoptions)
                                        .then(()=>{
                                            console.log("it spoke tts worked");
                                        })
                                        .catch((ttserr)=>{
                                            alert(JSON.stringify(ttserr) +" "+JSON.parse(notification.data).AlarmText+" "+ notification.data + "status is"+status+ "didnt speak");
                                        });
                                    let app: App;
                                    app.getActiveNav().push("AlarmPage");
                                });

                                //display toast to confirm schedule;
                                this.presentToast("Word Alert Set Successfully for "+ this.AlarmTime, 5000);

                            })
                            .catch((haspermissionerr)=>{
                                alert(JSON.stringify(haspermissionerr +alarmdata[0].alarmtext+" at haspermision"));
                                console.log(JSON.stringify(haspermissionerr) + " couldnt check permission")
                            });
                    }
                    this.dismissLoad();
                },(fetcherr)=>{
                    this.dismissLoad();
                    this.presentToast("bad connection" , 5000);
                })
        }
    }



    setPastorAlarm(){
        if(this.AlarmHour == null || this.AlarmHour == "00" || this.AlarmMin == null){
            this.presentToast("Please set your alert time", 5000);
        }else{
            if(this.AlarmAm == "Pm" ){
                if(this.AlarmHour != 12 ){
                    this.AlarmHour = (parseInt(this.AlarmHour) + 12);
                    if(this.AlarmHour > 24){
                        this.presentToast("please reset your alert time, current value is invalid", 5000);
                    }else{
                        this.AlarmHour = this.AlarmHour.toString();
                    }
                }
            }else{
                if(this.AlarmHour == 12 ){
                    this.AlarmHour = "00";
                }
            }

            this.AlarmTime = this.AlarmHour + this.AlarmMin;
            //formalt alarmtypeid
            let alarmtypeid;
            if(this.AlarmType == "Quotation"){
                alarmtypeid = 1;
            }else{
                alarmtypeid = 2;
            }
            //get alert text from server;
            let postdata = {
                getpastoralarmbytype: "yes",
                alarmtypeid: alarmtypeid,
                pastorid: this.PastorId
            };
            this.presentLoading("please wait");
            this.httpservice.postStuff("/api/alarm/index.php",JSON.stringify(postdata))
                .subscribe((alarmfetch)=>{
                    let alarmdata = alarmfetch.results;
                    if(alarmdata == "0"){
                        this.presentToast(alarmfetch.message + " no", 5000);
                    }else{
                        let day = new Date();
                        this.lnotification.hasPermission()
                            .then((hasperm)=>{
                                if(!hasperm){
                                    this.lnotification.registerPermission()
                                        .then((Rqst)=>{
                                            if(Rqst){
                                                console.log("permission granted");
                                            }else{
                                                alert("Permission to set alert denied"+ JSON.stringify(Rqst));
                                            }
                                        })
                                        .catch((Rqsterr)=>{
                                            alert("Permission to set alert denied"+ JSON.stringify(Rqsterr));
                                            console.log(JSON.stringify(Rqsterr))
                                        })
                                }
                                this.lnotification.schedule({
                                    "id": this.AlarmTime,
                                    "title": alarmdata[0].title,
                                    "data": {"AlarmText": alarmdata[0].alarmtext, "author": 'Pst '+alarmdata[0].firstname+' '+alarmdata[0].surname,"time": this.AlarmTime},
                                    "firstAt": new Date(day.getFullYear(),day.getMonth(),day.getDate(),this.AlarmHour,this.AlarmMin,0,0),
                                    "every": "day",
                                    sound:"file://assets/notification.mp3"
                                });
                                this.lnotification.on("click", (notification,status)=>{
                                    let ttsoptions: TTSOptions = {
                                        "text": JSON.parse(notification.data).AlarmText,
                                        "locale": 'en-US',
                                        "rate": 0.6
                                    };
                                    this.tts.speak(ttsoptions)
                                        .then(()=>{
                                            console.log("it spoke tts worked");
                                        })
                                        .catch((ttserr)=>{
                                            alert(JSON.stringify(ttserr) +" "+JSON.parse(notification.data).AlarmText+" "+ notification.data + "status is"+status+ "didnt speak");
                                        });
                                    let app: App;
                                    app.getActiveNav().push("AlarmPage");
                                });

                                //display toast to confirm schedule;
                                this.presentToast("Word Alert Set Successfully for "+ this.AlarmTime, 5000);

                            })
                            .catch((haspermissionerr)=>{
                                alert(JSON.stringify(haspermissionerr +alarmdata[0].alarmtext+" at haspermision"));
                                console.log(JSON.stringify(haspermissionerr) + " couldnt check permission")
                            });
                    }
                    this.dismissLoad();
                },(fetcherr)=>{
                    this.dismissLoad();
                    this.presentToast("bad connection" , 5000);
                })
        }
    }

    ionViewDidLoad() {
       console.log('ionViewDidLoad AlarmPage');
    }


  toggleMenu(){
     this.menuCtrl.toggle();
  }

  //navigation;
  pushPage(str: string, params: any){
      this.navCtrl.push(str, params);
  }

  toggleAlarmMenu(){
      this.AlarmMenu = !this.AlarmMenu;
  }

    setMeridian(){
        let alert = this.alertCtrl.create({
            subTitle: "Meridian",
            inputs: [
                {
                    label: "Am",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmAm = "Am";
                    }
                },
                {
                    label: "Pm",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmAm = "Pm";
                    }
                }
                ],
            buttons:[
                {
                    text: "Ok",
                    handler: ()=>{
                        return true;
                    }
                },
                {
                    text: "Cancel",
                    handler: ()=>{
                        this.AlarmAm = "Am";
                        return true;
                    }
                }

            ]
        });
        alert.present();
    }


    setHour(){
        let alert = this.alertCtrl.create({
            subTitle: "Hour",
            inputs: [
                {
                    label: "01",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "01";
                    }
                },
                {
                    label: "02",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "02";
                    }
                },
                {
                    label: "03",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "03";
                    }
                },
                {
                    label: "04",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "04";
                    }
                },
                {
                    label: "05",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "05";
                    }
                },
                {
                    label: "06",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "06";
                    }
                },
                {
                    label: "07",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "07";
                    }
                },
                {
                    label: "08",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "08";
                    }
                },
                {
                    label: "09",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "09";
                    }
                },
                {
                    label: "10",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "10";
                    }
                },
                {
                    label: "11",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "11";
                    }
                },
                {
                    label: "12",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmHour = "12";
                    }
                }

            ],
        buttons: [
            {
                text: "Ok",
                handler: ()=>{
                    return true;
                }
            },
            {
                text: "Cancel",
                handler: ()=>{
                    this.AlarmHour = "00";
                    return true;
                }
            }
        ]
        });
        alert.present();
    }

    setMinute(){
        let alert = this.alertCtrl.create({
            title: "Minute",
            inputs: [
                {
                    label: "00",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "00";
                    }
                },
                {
                    label: "01",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "01";
                    }
                },
                {
                    label: "02",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "02";
                    }
                },
                {
                    label: "03",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "03";
                    }
                },
                {
                    label: "04",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "04";
                    }
                },
                {
                    label: "05",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "05";
                    }
                },
                {
                    label: "06",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "06";
                    }
                },
                {
                    label: "07",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "07";
                    }
                },
                {
                    label: "08",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "08";
                    }
                },
                {
                    label: "09",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "09";
                    }
                },
                {
                    label: "10",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "10";
                    }
                },
                {
                    label: "11",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "11";
                    }
                },
                {
                    label: "12",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "12";
                    }
                },
                {
                    label: "13",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "13";
                    }
                },
                {
                    label: "14",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "14";
                    }
                },
                {
                    label: "15",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "15";
                    }
                },
                {
                    label: "16",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "16";
                    }
                },
                {
                    label: "17",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "17";
                    }
                },
                {
                    label: "18",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "18";
                    }
                },
                {
                    label: "19",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "19";
                    }
                },
                {
                    label: "20",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "20";
                    }
                },
                {
                    label: "21",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "21";
                    }
                },
                {
                    label: "22",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "22";
                    }
                },
                {
                    label: "23",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "23";
                    }
                },
                {
                    label: "24",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "24";
                    }
                },
                {
                    label: "25",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "25";
                    }
                },
                {
                    label: "26",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "26";
                    }
                },
                {
                    label: "27",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "27";
                    }
                },
                {
                    label: "28",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "28";
                    }
                },
                {
                    label: "29",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "29";
                    }
                },
                {
                    label: "30",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "30";
                    }
                },
                {
                    label: "31",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "31";
                    }
                },
                {
                    label: "32",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "32";
                    }
                },
                {
                    label: "33",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "33";
                    }
                },
                {
                    label: "34",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "34";
                    }
                },
                {
                    label: "35",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "35";
                    }
                },
                {
                    label: "36",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "36";
                    }
                },
                {
                    label: "37",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "37";
                    }
                },
                {
                    label: "38",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "38";
                    }
                },
                {
                    label: "39",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "39";
                    }
                },
                {
                    label: "40",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "40";
                    }
                },
                {
                    label: "41",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "41";
                    }
                },
                {
                    label: "42",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "42";
                    }
                },
                {
                    label: "43",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "43";
                    }
                },
                {
                    label: "44",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "44";
                    }
                },
                {
                    label: "45",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "45";
                    }
                },
                {
                    label: "46",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "46";
                    }
                },
                {
                    label: "47",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "47";
                    }
                },
                {
                    label: "48",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "48";
                    }
                },
                {
                    label: "49",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "49";
                    }
                },
                {
                    label: "50",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "50";
                    }
                },
                {
                    label: "51",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "51";
                    }
                },
                {
                    label: "52",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "52";
                    }
                },
                {
                    label: "53",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "53";
                    }
                },
                {
                    label: "54",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "54";
                    }
                },
                {
                    label: "55",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "55";
                    }
                },
                {
                    label: "56",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "56";
                    }
                },
                {
                    label: "57",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "57";
                    }
                },
                {
                    label: "58",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "58";
                    }
                },
                {
                    label: "59",
                    type: "radio",
                    handler: ()=>{
                        this.AlarmMin = "59";
                    }
                }
            ],

            buttons:[
                {
                    text: "OK",
                    handler: ()=>{
                        return true;
                    }
                },
                {
                    text: "Cancel",
                    handler: ()=>{
                        this.AlarmMin = "00";
                        return true;
                    }
                }
            ]
        })
        alert.present();
    }
}
