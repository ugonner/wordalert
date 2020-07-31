import { Component } from '@angular/core';
import {Platform,IonicPage,ToastController,NavController,MenuController PopoverController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
/*
import { Storage } from '@ionic/storage';
*/
import { TextToSpeech, TTSOptions } from '@ionic-native/text-to-speech';
import { SpeechRecognition, SpeechRecognitionListeningOptionsAndroid } from '@ionic-native/speech-recognition';
import { Vibration } from '@ionic-native/vibration';
/*
import { PushactionsProvider } from '../../providers/pushactions/pushactions';
*/
/*
import { FCM } from '@ionic-native/fcm';
*/

/*
import { Push, PushObject, PushOptions } from '@ionic-native/push';
*/
/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
    constructor(public platform: Platform, private menuCtrl: MenuController, public navCtrl: NavController, private httpservice:
        HttpservicesProvider, private popoverCtrl : PopoverController,/* private storage: Storage,*/
        private toastCtrl: ToastController, private tts: TextToSpeech, private speechRecognition: SpeechRecognition,
        private vibration: Vibration,/* private pushservice: PushactionsProvider*/) {

    }
    public bibleappfirstname = 'Guest';
    public ClickCount: number = 0;
    ionViewDidLeave(){
        /*this.logger.unsubscribe();*/
    }




/*
    ionViewDidLoad(){
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
                            this.presentToast("fcm error"+ fcmerror, 5000)
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
                    console.log('login successful');
                    return true;
                }
            },err=>{
                this.presentToast(err+'not login', 5000);
                this.signInModal();
                console.log(err);
                return false;
            });
    }
*/

    getQuotationFromSpeech(){
        this.platform.ready()
            .then((ready)=>{
                if(ready){
                    this.vibration.vibrate(50);
/*                        .then((vibrated)=>{*/
                            this.speechRecognition.isRecognitionAvailable()
                                .then((isRegistered)=>{
                                    if(isRegistered){
                                        this.speechRecognition.hasPermission()
                                            .then((hasperm)=>{
                                                if(!hasperm){
                                                    this.speechRecognition.requestPermission()
                                                        .then((perm)=>{
                                                            if(perm){
                                                                console.log("requested permission");
                                                            }else{
                                                                this.speakWord("permission denied on this device, try again");
                                                                this.presentToast("no permission requested and not granted", 5000);
                                                            }
                                                        }).catch((permreqsterr)=>{
                                                            this.speakWord("you did not grant permission to change your speech on this device");
                                                            this.presentToast("unable to request perm"+ permreqsterr , 5000)
                                                        })
                                                }

                                                //get speech;
                                                let options: SpeechRecognitionListeningOptionsAndroid = {
                                                    matches: 5
                                                };
                                                this.presentLoading("getting your quote");
                                                this.speechRecognition.startListening(options)
                                                    .subscribe((termsArray: Array<string>)=>{
                                                        this.speakWord("word gotten, you said, "+ termsArray[0]+ "?");
                                                        this.dismissLoad();
                                                        if(this.ClickCount == 0){
                                                            this.QuotationBook = termsArray[0];
                                                        }
                                                        else if(this.ClickCount == 1){
                                                            this.QuotationChapter = termsArray[0];
                                                        }
                                                        else if(this.ClickCount == 2){
                                                            this.QuotationVerse1 = termsArray[0];
                                                        }
                                                        else{
                                                            this.QuotationVerse2 = termsArray[0];
                                                        }
                                                        this.ClickCount++;
                                                    }, (fetchspeecherr)=>{
                                                        this.dismissLoad();
                                                        this.speakWord("this device can not convert word, maybe bad data connection.  clear and start afresh");
                                                        this.presentToast("unable to convert text " , 5000);
                                                    });

                                                console.log("has permission for speech recg");
                                            }).catch((haspermerr)=>{
                                                this.speakWord("unable to check permission for speech recognition in your device")
                                                this.presentToast("can not check permission", 5000);
                                            });
                                    }
                                }).catch((isavailableerr)=>{
                                    this.speakWord("speech recognition is not available in this device");
                                    this.presentToast("speech recognition not available in your device"+ isavailableerr, 5000);
                                })
/*
                        }).catch((vibrateerr)=>{
                            this.presentToast("could not access device platform actions like vibration"+ vibrateerr, 3000);
                        })*/

                }
            }).catch((platformreadyerr)=>{
                this.presentToast("unable to get platform ready"+ platformreadyerr, 5000);
            });
    }


    //clear quotation;
    clearQuotation(){
        this.vibration.vibrate(50);
        this.ClickCount = 0;
        this.QuotationBook = "";
        this.QuotationChapter = 1;
        this.QuotationVerse1 = 1;
        this.QuotationVerse2 = 0;
        this.PassageText = "";
        this.speakWord("quotations cleared");
    }



    toggleMenu(){
        this.menuCtrl.toggle();
    }


    //read bible

    public QuotationBook: any;
    public QuotationChapter: any = 1;
    public QuotationVerse1: any = 1;
    public QuotationVerse2: any = 0;
    public Quotation = " ";

    public PassageText: string;

    presentToast(message, duration){
        let toast = this.toastCtrl.create({
            "message":message,
            "position":"middle",
            "duration": duration
        });
        toast.present();

    }
    public displaySetPassageForm: boolean = true;
    toggleDisplaySetPassage(){
        this.displaySetPassageForm = !this.displaySetPassageForm;
    }

    pushPage(str: string){
        this.navCtrl.push(str);
    }

    speakWord(str: string){
        this.tts.speak(str).then((spoke)=>{
            console.log("spoke");
        }).catch((spokeerr)=>{
            this.presentToast("unable to say"+ str, 3000);
        })
    }
   public LoadingMessage: string;
    public DisplaySpinner: boolean;
    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }

    dismissLoad(){
        this.DisplaySpinner = false;
    }


    readPassage(){
        this.vibration.vibrate(100);
        if(this.QuotationBook == null || this.QuotationBook == ""){
            this.presentToast("please put a quotation ", 5000);
        }else{
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
                    let passagetext:any = [];
                    for(let i = 0; i<res.length; i++){
                        passagetext.push(res[i].text);
                    }
                    this.Quotation = this.QuotationBook +" " + this.QuotationChapter + ":"+ this.QuotationVerse1 +"-"+ this.QuotationVerse2;

                    passagetext = passagetext.toString();

                    //speak passage;
                    let ttsoptions: TTSOptions = {
                        "text": passagetext,
                        "rate": 0.6
                    };
                    this.tts.speak(ttsoptions)
                        .then(()=>{
                            console.log("spoke the passage");
                        })
                        .catch((speakerr)=>{
                            this.presentToast("unable to speak out, try again", 5000);
                        });
                        this.PassageText = passagetext;
                        this.dismissLoad();
                }, (reqterr)=>{
                    this.dismissLoad();
                    this.presentToast("unable to get your quotation "+reqterr, 5000);
                })
        }
    }

    readRandomPassage(){
        let apiuri = "/api/?passage=random&type=json";
        this.presentLoading("getting you a quotation, please wait");
        this.httpservice.getBibleQuotation(apiuri)
            .subscribe((res)=>{
                let passagetext:any = [];
                for(let i = 0; i<res.length; i++){
                    passagetext.push(res[i].text);
                }
                this.Quotation = " ";
                passagetext = passagetext.toString();

                //speak passage;
                let ttsoptions: TTSOptions = {
                    "text": passagetext,
                    "rate": 0.5
                };
                this.tts.speak(ttsoptions)
                    .then(()=>{
                        console.log("spoke the passage");
                    })
                    .catch((speakerr)=>{
                        this.presentToast("unable to speak out, try again", 5000);
                    });
                this.PassageText = passagetext;
                this.dismissLoad();
            }, (reqterr)=>{
                this.dismissLoad();
                this.presentToast("unable to get your quotation ", 5000);
            })
    }



    signInModal(){
        let mod = this.popoverCtrl.create("LoginModalPage");
        mod.present();
    }
}
