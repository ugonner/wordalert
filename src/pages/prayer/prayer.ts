import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { PrayerservicesProvider } from '../../providers/prayerservices/prayerservices';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PrayerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-prayer',
  templateUrl: 'prayer.html',
})
export class PrayerPage {

    public PrayerId: number;
    public PrayerFollowers: Array<any> = [];
    public OwnerId: number;
    public Prayer: any = new Map();
    public LocalUser;
    public LocalUserid: number;
    public IsOwner: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
      private storage: Storage, private prayerservice: PrayerservicesProvider) {
  }


    //using spinners as loading detectors;
    private LoadingMessage: string;
    public DisplaySpinner: boolean;

    private presentLoading(str){
        this.LoadingMessage = str;
        this.DisplaySpinner = true;

    }

    private dismissLoad(){
        this.DisplaySpinner = false;
    }

    private presentToast(message, duration){
        this.prayerservice.presentToast(message, duration)
    }

  ionViewDidLoad() {
    //get prayer details;
    //get user;
    this.storage.get('bibleappuserdata')
        .then((userdata)=>{
            if(userdata){
                this.LocalUserid = userdata.id;
                this.LocalUser = userdata;

                //get prayer;

                this.PrayerId = this.navParams.get("prayerid");
                let postdata = {
                    getprayer: 'yes',
                    prayerid: this.PrayerId
                };

                this.presentLoading("please wait");
                this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
                    .subscribe((data)=>{
                        this.dismissLoad();
                        if(data.results == "0"){
                            this.presentToast(data.message, 5000);
                        }else{
                            //check isowner;
                            let prayer = data.results[0];
                            if(prayer.userid == this.LocalUserid){
                                this.IsOwner = true;
                            }

                            this.Prayer.set('prayerid',prayer.prayerid );
                            this.Prayer.set('prayertext',prayer.prayertext );
                            this.Prayer.set('userid',prayer.userid );
                            this.Prayer.set('dateofpublication',prayer.dateofpublication );
                            this.Prayer.set('noofprayeractions',prayer.noofprayeractions );
                            this.Prayer.set('prayergroupid',prayer.prayergroupid );
                            this.Prayer.set('groupname',prayer.groupname );
                            this.Prayer.set('firstname',prayer.firstname );
                            this.Prayer.set('surname',prayer.surname );
                            this.Prayer.set('answered',prayer.answered );
                            this.Prayer.set('isfollowing',prayer.isfollowing );
                            if(prayer.prayertypeid){
                                this.Prayer.set('prayertypeid',prayer.prayertypeid );
                            }
                        }
                    },(err)=>{
                        this.dismissLoad();
                        this.presentToast(" Bad Connection or response", 5000);
                    });
            }
        }).catch((getusererr)=>{
            this.presentToast(getusererr, 5000);
        });

    console.log('ionViewDidLoad PrayerPage');
  }

    //join prayer;
    joinInPrayer(prayerid,ownerid,prayertext,index){
        //effect immediate view changes;

        let PrayerFollower = {
            userid: this.LocalUserid,
            firstname: this.LocalUser.firstname,
            surname: this.LocalUser.surname,
            rolename: this.LocalUser.rolename,
            prayeractiontext: prayertext,
            dateofpublication: new Date().toString()
        };

        //add to followers;
        this.PrayerFollowers.splice(0,0,PrayerFollower);
        let noofaction = this.Prayer.get('noofprayeractions');
        let noofactions = noofaction + 1;
        this.Prayer.set('noofprayeractions', noofactions );
        this.Prayer.set('isfollowing', 1);

        this.prayerservice.joinPrayer(prayerid,ownerid,prayertext,index);

    }

    renegeFromPrayer(prayerid: number,index: number){
        //effect immediate view changes;
        this.PrayerFollowers.splice(index,1);
        let noofaction = this.Prayer.get('noofprayeractions');
        let noofactions = noofaction - 1;
        this.Prayer.set('noofprayeractions', noofactions );
        this.Prayer.set('isfollowing', 0);

        if(this.prayerservice.leavePrayer(prayerid,index)){
            return true;
        }
        return true;
    }

    //edit prayer;
    editPrayer(property: string, value: any, prayerid: number){
        if(value == '' || value == " " || value == null){
            this.prayerservice.presentToast("empty field, type in ", 5000);
            return false;
        }

        let postdata = {
            editprayer: 'yes',
            prayerid: prayerid,
            property: property,
            value: value
        };

        this.presentLoading("updating prayer");
        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.presentToast(data.message + 'not edited', 5000);
                }else{
                    this.Prayer.set(property,value);
                    this.presentToast(data.message + 'ya edited', 5000);

                }
            },(err)=>{
                this.presentToast(" Bad Connection or response", 5000);
            })

    }

    //get prayer followers;
    getPrayerFollowers(prayerid){
        let postdata = {
            getprayerfollowers: 'yes',
            prayerid: prayerid
        };
        this.presentLoading('please wait');
        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);
                }else{
                    this.PrayerFollowers = data.results;
                }
            }, (err)=>{
                this.dismissLoad();
                this.presentToast(err, 5000);
            })
    }
    //push page;
    pushPage(str: string, navparams: any){
        this.navCtrl.push(str, navparams);
    }
}
