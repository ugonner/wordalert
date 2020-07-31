import { Component } from '@angular/core';
import { ToastController,IonicPage, NavController,NavParams, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PastorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-pastors',
    templateUrl: 'pastors.html',
})
export class PastorsPage {
    public UserPastors: any = [];
    public Pastors: any = [];
    public ClassMessage: string;
    public DisplayUserpastors: boolean = true;
    public DisplayAllpastors: boolean = false;
    public DisplaySpinner: boolean;
    public LoadingMessage: string;
    constructor(public navCtrl: NavController, public navParams: NavParams,
                private alertCtrl: AlertController, private toastCtrl: ToastController, private http: HttpservicesProvider,
                private storage: Storage) {
    }

    /*ionViewDidLoad() {
     console.log('ionViewDidLoad PrayerpastorPage');
     }*/

    ionViewDidEnter() {
        this.storage.get("userpastors")
            .then((userpsts)=>{
                if(userpsts){
                    this.UserPastors = userpsts;
                }else{
                    this.presentToast("You do not belong to any pastor, view all pastors to join one", 5000);
                    this.ClassMessage = "You do not belong to any pastor, view all pastors to join one";
                }
            }).catch((getuserpstserr)=>{
                this.presentToast("unable to access device storage", 5000);
            });
    }

    //display user pastors;
    displayUserPastors(){
        this.DisplayAllpastors = false;
        this.DisplayUserpastors = true;
    }


    //retrieve all user pastors;
    retrieveUserPastors(){
        this.presentLoading("fetching your pastors, please wait");
        this.http.postStuff("/api/pastor/index.php",JSON.stringify({getuserPastors: "yes"}))
            .subscribe((data)=>{
                this.dismissLoad();
                let results = data.results;
                if(results == "0"){
                    this.presentToast(data.message, 5000);
                }else{
                    this.UserPastors = results;
                    this.DisplayUserpastors = true;
                    this.storage.set("userpastors",results)
                        .then(()=>{
                            this.presentToast("your pastors restored and stored", 5000);
                        }).catch((storeerr)=>{
                            this.presentToast("unable to store your pastors on your device try again", 5000);
                        })
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            })
    }

    //get all prayer pastors;
    getAllPastors(){
                //get all pastors
                this.presentLoading("getting pastors, biko wait a sec ... ");
                this.http.postStuff("/api/pastor/index.php",JSON.stringify({getPastors:"y"}))
                    .subscribe((data)=>{
                        this.dismissLoad();
                        if(data.results == 0){
                            this.ClassMessage = data.message;
                        }else{
                            this.ClassMessage = data.message;
                            this.Pastors = data.results;
                            this.DisplayUserpastors = false;
                            this.DisplayAllpastors = true;
                        }
                        console.log(data.results+" got success");
                    },(err)=>{
                        this.ClassMessage = " Bad Connection or response";
                        this.dismissLoad();
                        this.presentToast(" Bad Connection or response", 5000);
                    })
    }


    //using spinners as loading detectors;
    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }
    dismissLoad(){
        this.DisplaySpinner = false;
    }

    presentToast(message: string, duration: any){
        let toast = this.toastCtrl.create({
            "message": message,
            "duration": duration,
            "position": "middle"
        });
        toast.present();

    }

//PRESENT leave pastor ALERT
    presentLeavepastorAlert(pastorid, grpindex){
        let alert = this.alertCtrl.create({
            "title": "Leave pastor",
            "message": "You sure want to leave this pastor ?",

            "buttons":[
                {
                    "text": "Leave pastor",
                    "handler": ()=>{
                        return this.leavepastor(pastorid, grpindex)
                    }
                },
                {
                    "text": "Never Nind",
                    "handler":()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }

    //leave pastor
    leavepastor(pastorid, pastorindex){
        //get prayer pastors members
        this.presentLoading("removing you out of this pastor");
        this.http.postStuff("/api/prayerpastor/index.php",JSON.stringify({"leavepastor":"y", "pastorid": pastorid}))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast("Sorry, this pastor is not sanctioned  ", 4000);
                }else{
                    this.presentToast("You have left this pastor", 5000);
                    //remove pastor from user pastors data;
                    this.storage.get("userpastors")
                        .then((grps)=>{
                            if(grps){
                                let pastors: Array<any> = grps;
                                for(let i=0; i<pastors.length; i++){
                                    if(pastors[i].pastorid == pastorid){
                                        pastors.splice(i,1);
                                    }
                                }
                                this.presentLoading("now removing pastor from your data");
                                this.storage.set("userpastors",pastors)
                                    .then((setuserpastor)=>{
                                        this.dismissLoad();
                                        console.log("user pastors reset");
                                    }).catch((setuserpastorserr)=>{
                                        this.dismissLoad();
                                        this.presentToast("user pastors not reset"+setuserpastorserr, 5000);
                                    })
                            }
                        }).catch((getuserpastorserr)=>{
                            this.presentToast("unable to get user pastor data anyways", 5000);
                        });
                    //now remove from userpastors array;
                    this.UserPastors.splice(pastorindex,1);
                }
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response",5000);
                console.log(JSON.stringify(reqterr));
            })
    }


//track notifications displayed at DOM;
    trackpastor(index, item){
        return index;
    }


    //navigate to page;
    pushPage(pagename: string, params: any){
        this.navCtrl.push(pagename,params);
    }
}
