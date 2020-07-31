import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TextToSpeech, TTSOptions } from '@ionic-native/text-to-speech';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { PrayerservicesProvider } from '../../providers/prayerservices/prayerservices';
/**
 * Generated class for the MainpagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mainpage',
  templateUrl: 'mainpage.html',
})
export class MainpagePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
      private prayerservice: PrayerservicesProvider, private tts: TextToSpeech) {
  }

    pushPage(str: string, params: any){
        this.navCtrl.push(str, params);
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MainpagePage');
  }



   public DisplaySpinner: boolean = false;
    readRandomPassage(){
        this.DisplaySpinner = true;
        let apiuri = "/api/?passage=random&type=json";
        this.httpservice.getBibleQuotation(apiuri)
            .subscribe((res)=>{
                this.DisplaySpinner = false;
                let passagetext:any = [];
                for(let i = 0; i<res.length; i++){
                    passagetext.push(res[i].text);
                }

                passagetext = passagetext.toString();

                //speak passage;
                let ttsoptions: TTSOptions = {
                    "text": passagetext,
                    "rate": 0.7
                };
                this.tts.speak(ttsoptions)
                    .then(()=>{
                        console.log("spoke the passage");
                    })
                    .catch((speakerr)=>{
                        this.prayerservice.presentToast("unable to speak out, try again", 5000);
                    });

            }, (reqterr)=>{
                this.DisplaySpinner = false;
                this.prayerservice.presentToast("unable to get your quotation ", 5000);
            })
    }
}
