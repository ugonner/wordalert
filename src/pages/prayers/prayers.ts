import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PrayerservicesProvider } from '../../providers/prayerservices/prayerservices';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
/**
 * Generated class for the PrayersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-prayers',
  templateUrl: 'prayers.html',
})
export class PrayersPage {

    public Prayers: Array<any> = [];
    public LocalUser;
    public pgn: number = 0;
    public PrayerTypeId: number;
    public UserId: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage,
      private httpservice: HttpservicesProvider, private prayerservice: PrayerservicesProvider) {
  }

  ionViewDidLoad() {
   this.PrayerTypeId = this.navParams.get("prayertypeid");
    this.storage.get("bibleappuserdata")
        .then((userdata: any)=>{
            if(userdata){
                this.UserId = userdata.id;
                this.storage.get('userprayers')
                    .then((userprayers)=>{
                        if(userprayers){
                            for(let i = 0; i<userprayers.length; i++){
                                if(userprayers[i].prayertypeid == this.PrayerTypeId){
                                    userprayers[i].userid = userdata.id;
                                    userprayers[i].firstname = userdata.firstname;
                                    userprayers[i].surname = userdata.surname;
                                    userprayers[i].noofprayeractions = "-";
                                    this.Prayers.push(userprayers[i])
                                }
                            }
                        }else{
                            this.prayerservice.presentToast("no prayers found", 5000);
                        }
                    }).catch((err)=>{
                        this.prayerservice.presentToast("no prayers found" + err, 5000);
                    });
            }
        }).catch((err)=>{
            this.prayerservice.presentToast("no device data got", 3000);
        })
    console.log('ionViewDidLoad PrayersPage');
  }

    //get prayers;
    getPrayers(){
        let postdata = {
            getprayers: 'yes'

        };
        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.prayerservice.presentToast(data.message, 5000);
                }else{
                    this.Prayers = data.results;
                }
            },(err)=>{
                this.prayerservice.presentToast(" Bad Connection or response", 5000);
            });
    }


    //get prayers;
    getPrayersByTypeId(prayertypeid){
        let postdata = {
            getprayersbytypeid: 'yes',
            prayertypeid: prayertypeid
        };

        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.prayerservice.presentToast(data.message, 5000);
                }else{
                    this.Prayers = data.results;
                }
            },(err)=>{
                this.prayerservice.presentToast(" Bad Connection or response", 5000);
            });
    }

    //get more; by infinite scroll;
    getMorePrayers(apiurl: string, pstdata: any){
            let postdata: any = [];
                postdata = pstdata;
                postdata.pgn = this.pgn++;

            this.httpservice.postStuff(apiurl, JSON.stringify(postdata))
                .subscribe((data)=>{
                    if(data.results == "0"){
                        this.prayerservice.presentToast(data.message, 5000);
                    }else{
                        this.Prayers.push(data.results);
                    }
                },(err)=>{
                    this.prayerservice.presentToast(" Bad Connection or response", 5000);
                });

    }


    //restore user prayers;
    retrievePrayers(prayertypeid){
        let postdata = {
            getuserprayers: 'yes'
        };
        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                let results = data.results;
                if(results == "0"){
                    this.prayerservice.presentToast(data.message, 5000);
                }else{
                    this.storage.set('userprayers', results)
                        .then((userprayers)=>{
                            let newprayers: Array<any> = [];
                            for(let i=0; i<results.length; i++){
                                if(results[i].prayertypeid == prayertypeid){
                                     newprayers.push(results[i]);
                                }
                            }
                            if(newprayers.length > 0){
                                this.Prayers = newprayers;
                            }else{
                                this.prayerservice.presentToast("your requests restored, but you've not shared such requests", 5000);
                            }
                        }).catch((storeerr)=>{
                            this.prayerservice.presentToast("unablle to store prayers", 5000);
                        });
                }
            },(err)=>{
                this.prayerservice.presentToast(" Bad Connection or response", 5000);
            });
    }

    pushPage(str: string, navparams: any){
        this.navCtrl.push(str, navparams);
    }
}
