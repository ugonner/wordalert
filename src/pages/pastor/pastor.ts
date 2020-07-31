import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the pastorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-pastor',
    templateUrl: 'pastor.html',
})
export class PastorPage {

    constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
                private storage: Storage, private toastCtrl: ToastController,
                private alertCtrl: AlertController) {
    }
/*    public pastorAlerts: any = [];*/
    public Admin;
    public Members: Array<any>;
    public pastorAlerts: Array<any>;
    public Userid;
    public IsAdmin: boolean;
    public IsAMember: boolean;
    public NoOfMembers: any;
    public ErrMessage: string;
    public pastorid: any;
    public ClassMessage;
    public SetAlertForm: boolean;
    public AlertType: boolean;
    public DisplayQuotationForm: boolean = false;
    public AlertQuotation: any;
    public AlertText: any;
    public AlertBook: any;
    public AlertChapter: any;
    public AlertVerse1: any;
    public AlertVerse2: any;
    public DisplayMembers: boolean = true;
    public DisplaySpinner: boolean = true;

    ionViewDidLoad() {
        console.log('ionViewDidLoad pastorPage');
    }

    ionViewCanEnter(){
        this.storage.get("bibleappuserdata")
            .then((userdata)=>{
                this.Userid = userdata.id;
                if(this.Userid){
                    this.pastorid = this.navParams.get("pastorid");
                    //get all pastors
                    let postdata = {
                        getPastor:"y",
                        Pastorid: this.pastorid
                    };
                    this.presentLoading("loading pastor data");
                    this.httpservice.postStuff("/api/pastor/index.php",JSON.stringify(postdata))
                        .subscribe((data)=>{
                            this.dismissLoad();
                            if(data.results == 0){
                                this.presentToast( data.message +" may be database errors",5000);

                            }else{
                                this.NoOfMembers= data.results.length;
                                this.Admin = data.results[0];
                                this.Members= data.results;

                                //check if user is pastor admin;
                                if(this.Userid == this.Members[0].userid){
                                    this.IsAdmin = true;
                                }

                                //check membership;
                                for(let i = 1; i < this.NoOfMembers; i++){
                                    if(this.Userid == this.Members[i].userid){
                                        this.IsAMember = true;
                                        i = this.NoOfMembers++;
                                    }
                                }
                            }
                        },(err)=>{
                            this.dismissLoad();
                            this.presentToast(" Bad Connection or response", 5000);
                            this.ClassMessage = " Bad Connection or response";
                            console.log("unable to get to server"+ err);
                        });
                }
                console.log("got userdata ")
            })
            .catch((userdataerr)=>{
                this.presentToast("unable to get app ueer data "+userdataerr, 10000);
                //get all pastors
                this.presentLoading("getting pastor data anyways");
                this.pastorid = this.navParams.get("pastorid");
                this.httpservice.postStuff("/api/pastor/index.php",JSON.stringify({getpastor:"y", pastorid: this.pastorid}))
                    .subscribe((data)=>{
                        this.dismissLoad();
                        if(data.results == 0){
                            this.presentToast(data.message,5000);
                            this.ClassMessage = data.message;
                        }else{
                            /*                            this.presentToast("got there fine 2",5000);*/
                            /*this.Admin = data.results[0];*/
                            this.Members= data.results;
                        }
                    },(err)=>{
                        this.dismissLoad();
                        this.presentToast(" Bad Connection or response", 5000)
                        this.ClassMessage = " Bad Connection or response";
                        console.log("unable to get to server"+ err);
                    });
            });

        console.log('ionViewDidEnter pastorPage');
    }


    //toggle alerttype;
    setQuotationForm(){
        this.DisplayQuotationForm = true;
    }
    //toggle alerttype;
    setProclamationForm(){
        this.DisplayQuotationForm = false;
    }

    //using spinners as loading detectors;
    public LoadingMessage: string;
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

    //create pastor alert quotation;
    createpastorQuotationAlert(pastorid){
        //build quotation format;
        let quotation:any;
        if(this.AlertBook == null || this.AlertBook == ""){
            this.AlertBook = "Genesis";
        }
        if(this.AlertVerse2 == null || this.AlertVerse2 == 0){
            quotation = this.AlertBook + "+" + this.AlertChapter + ":"+ this.AlertVerse1;
        }else{
            quotation = this.AlertBook + "+" + this.AlertChapter + ":"+ this.AlertVerse1+"-"+this.AlertVerse2;
        }

        //fetch quotation text;
        let apiuri = "/api/?passage="+quotation+"&type=json";
        this.presentLoading("getting your quotation, please wait");
        this.httpservice.getBibleQuotation(apiuri)
            .subscribe((res)=>{
                this.dismissLoad();
                let alarmtext:any = [];
                for(let i = 0; i<res.length; i++){
                    alarmtext.push(res[i].text);
                }
                this.AlertText = alarmtext.toString();

                //store quotation text to database;
                let postdata = {
                    createpastoralarmtext: "yes",
                    pastorid: pastorid,
                    alarmtypeid: 1,
                    alarmtext: this.AlertText,
                    alarmtitle: quotation
                };
                this.httpservice.postStuff("/api/alarm/index.php", postdata)
                    .subscribe((stored)=>{
                        if(stored.results == "0"){
                            this.presentToast(stored.message, 5000);
                        }else{
                            this.getpastorAlerts(pastorid, 1);
                        }

                    }, (storederr)=>{
                        this.presentToast("quotation text not stored for your pastor "+ storederr, 5000);
                    });
                console.log("successful fetch of quotation");
            },(fetchtexterr)=>{
                this.dismissLoad();
                this.presentToast("could not get quotation text ", 5000);
            });
    }



    createpastorProclamationAlert(pastorid){
        if(this.AlertText=="" || this.AlertText == null){
            this.presentToast("Your Proclamation Text must be filled", 5000);
        }else{
            //store quotation text to database;
            let postdata = {
                createpastoralarmtext: "yes",
                pastorid: pastorid,
                alarmtypeid: 2,
                alarmtext: this.AlertText,
                alarmtitle: this.AlertText.substr(0,50)
            };

            this.presentLoading("storing alert text");
            this.httpservice.postStuff("/api/alarm/index.php", postdata)
                .subscribe((stored)=>{
                    this.dismissLoad();
                    if(stored.results == "0"){
                        this.presentToast(stored.message, 5000);
                    }else{
                        this.presentToast("proclamation text stored successfully for your pastor", 5000);
                        this.getpastorAlerts(pastorid, 2);
                    }

                }, (storederr)=>{
                    this.dismissLoad();
                    this.presentToast( JSON.stringify(postdata)+" proclamation text not stored for your pastor "+ storederr, 30000);
                });
            console.log("successful fetch of quotation");
        }

    }

    //display pastor members;
    viewpastorMembers(){
        this.DisplayMembers = true;
    }

    //get pastor alerts;
    getpastorAlerts(pastorid, alerttypeid){
        //store quotation text to database;
        let postdata = {};
        if(alerttypeid == null){
            postdata = {
                getpastorallalarms: "yes",
                pastorid: pastorid
            };
        }else{
            postdata = {
                getpastoralarmbytype: "yes",
                pastorid: pastorid,
                alarmtypeid: alerttypeid
            };
        }
        this.presentLoading("fetching alerts please wait");
        this.httpservice.postStuff("/api/alarm/index.php", JSON.stringify(postdata))
            .subscribe((stored)=>{
                this.dismissLoad();
                if(stored.results== "0"){
                    this.presentToast(stored.message, 5000);
                }else{
                    this.pastorAlerts = stored.results;
                    this.pastorAlerts.forEach((alert)=>{
                        if(alert.alarmtypeid == 1){
                            alert.alarmtype = "Quotation";
                        }else{
                            alert.alarmtype = "Proclamation";
                        }
                    });
                    this.DisplayMembers = false;
                }

            }, (storederr)=>{
                this.dismissLoad();
                this.presentToast("alerts not got for your pastor "+ storederr, 5000);
            });
        console.log("successful fetch of quotation");
    }

    //present alart text;

    setAlert(){
        this.SetAlertForm = !this.SetAlertForm;
    }

    presentAlertText(alerttext){

        let alert = this.alertCtrl.create({
            subTitle: "Alert Message",
            message: alerttext,
            buttons: [
                {
                    text: 'Seen',
                    handler: ()=>{
                        return true;
                    }
                }
            ]
        });
        alert.present();
    }


    joinpastor(pastorid){
        //get prayer pastors members
        this.presentLoading("adding you to pastor");
        this.httpservice.postStuff("/api/pastor/index.php",JSON.stringify({"joinPastor":"y", "Pastorid": pastorid}))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.presentToast("Sorry you can not join, this pastor is not sanctioned  ", 4000);
                }else{
                    this.presentToast("Congrats, You have joined this pastor  ", 5000);
                    this.IsAMember = true;
                    //add pastor to userpastordata on storage;
                    let pastordata = {
                        pastorid: pastorid,
                        firstname: this.Admin.firstname,
                        surname: this.Admin.surname,
                        ministryid: this.Admin.ministryid,
                        ministryname: this.Admin.ministryname
                    };
                    this.storage.get("userpastors")
                        .then((psts)=>{
                            if(psts){
                                psts.push(pastordata);
                                this.storage.set("userpastors", [pastordata])
                                    .then((stored)=>{
                                        console.log("pastor stored");
                                    }).catch((storingerr)=>{
                                        this.presentToast("could not store pastor in device"+ storingerr, 5000);
                                    })
                            }else{
                                this.storage.set("userpastors", [pastordata])
                                    .then((stored)=>{
                                        console.log("pastor stored");
                                    }).catch((storingerr2)=>{
                                        this.presentToast("could not get and yet could not store pastor in device"+ storingerr2, 5000);
                                    })
                            }
                        }).catch((getuserpastorerr)=>{
                            this.presentToast("could not get user pastors", 4000);
                        })
                }
                this.dismissLoad();
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response",5000);
                this.ErrMessage = " Bad Connection or response";
                console.log(JSON.stringify(reqterr));
            })
    }

    //leave pastor
    leavepastor(pastorid){
        //get prayer pastors members
        this.presentLoading("moving you out this pastor");
        this.httpservice.postStuff("/api/pastor/index.php",JSON.stringify({"leavePastor":"y", "Pastorid": pastorid}))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast("Sorry, this pastor is not sanctioned  ", 4000);
                }else{
                    this.presentToast("You have left this pastor", 5000);
                    this.IsAMember = false;
                    //remove pastor from user pastors data;
                    this.presentLoading("now removing pastor from your data");
                    this.storage.get("userpastors")
                        .then((psts)=>{
                            this.dismissLoad();
                            if(psts){
                                let pastors: Array<any> = psts;
                                for(let i=0; i<pastors.length; i++){
                                    if(pastors[i].pastorid == pastorid){
                                        pastors.splice(i,1);
                                    }
                                }
                                this.storage.set("userpastors",pastors)
                                    .then((setuserpastor)=>{
                                        console.log("user pastors reset");
                                    }).catch((setuserpastorserr)=>{
                                        this.presentToast("user pastors not reset"+setuserpastorserr, 5000);
                                    })
                            }
                        }).catch((getuserpastorserr)=>{
                            this.dismissLoad();
                            this.presentToast("unable to get user pastor data anyways"+getuserpastorserr, 5000);
                        })
                }
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response",5000);
                this.ErrMessage = " Bad Connection or response";
            })
    }



    //navigate to page;
    pushPage(pagename: string, params: any){
        this.navCtrl.push(pagename,params);
    }
}
