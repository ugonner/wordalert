import { Component } from '@angular/core';
import { IonicPage, PopoverController, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { PrayerservicesProvider } from '../../providers/prayerservices/prayerservices';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PrayergroupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-prayergroup',
  templateUrl: 'prayergroup.html',
})
export class PrayergroupPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpservice: HttpservicesProvider,
      private storage: Storage, private alertCtrl: AlertController, private modalCtrl: PopoverController,
      private prayerservice: PrayerservicesProvider){
  }
  public PrayerGroupAlerts: any = [];
    public Admin;
    public Members: Array<any>;
    public GroupAlerts: Array<any>;
    public User: any;
    public Userid: number;
    public IsAdmin: boolean;
    public IsAMember: boolean;
    public NoOfMembers: any;
    public ErrMessage: string;
    public prayergroupid: any;

    public Prayers: Array<any>;
    public DisplayPrayers: boolean;

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

    public DisplayRequestForm: boolean;
    public PrayerTypeId: number = 1;

    toggleRequestForm(){
        this.DisplayRequestForm = !this.DisplayRequestForm;
    }
    /*ionViewDidLoad() {
    console.log('ionViewDidLoad PrayergroupPage');
  }*/

    ionViewDidLoad(){
        this.storage.get("bibleappuserdata")
            .then((userdata)=>{
                this.User = userdata;
                this.Userid = userdata.id;
                if(this.Userid){
                    this.prayergroupid = this.navParams.get("groupid");
                    //get all groups
                    let postdata = {
                        getgroup:"y",
                        groupid: this.prayergroupid
                    };
                    this.presentLoading("loading group data");
                    this.httpservice.postStuff("/api/prayergroup/index.php",JSON.stringify(postdata))
                        .subscribe((data)=>{
                            this.dismissLoad();
                            if(data.results == 0){
                                this.presentToast( data.message +" may be database errors",5000);
                                this.ClassMessage = data.message;
                            }else{
                                this.NoOfMembers= data.results.groupandmembers.length;
                                this.Admin = data.results.groupandmembers[0];
                                this.Members= data.results.groupandmembers;
                                this.Prayers = data.results.prayers;
                                this.DisplayPrayers = true;

                                //check if user is group admin;
                                if(this.Userid == this.Members[0].userid){
                                    this.IsAdmin = true;
                                }

                                //check membership;
                                for(let i = 0; i < this.NoOfMembers; i++){
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
                //get all groups
                this.presentLoading("getting group data anyways");
                this.prayergroupid = this.navParams.get("groupid");
                this.httpservice.postStuff("/api/prayergroup/index.php",JSON.stringify({getgroup:"y", groupid: this.prayergroupid}))
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

        console.log('ionViewDidEnter PrayergroupPage');
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

    presentToast(message: string, duration: number){
        this.prayerservice.presentToast(message, duration);
    }

    //create group alert quotation;
    createGroupQuotationAlert(groupid){
        //build quotation format;
        let quotation:any;
        if(this.AlertBook == null || this.AlertBook == ""){
            this.presentToast("Please enter bible book eg John, Malachi", 5000);
            return false;
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
                    creategroupalarmtext: "yes",
                    groupid: groupid,
                    alarmtypeid: 1,
                    alarmtext: this.AlertText,
                    alarmtitle: quotation
                };
                this.httpservice.postStuff("/api/alarm/index.php", postdata)
                    .subscribe((stored)=>{
                        if(stored.results == "0"){
                            this.presentToast(stored.message, 5000);
                        }else{
                            this.getGroupAlerts(groupid, 1);
                        }

                    }, (storederr)=>{
                        this.presentToast("quotation text not stored for your group "+ storederr, 5000);
                    });
                console.log("successful fetch of quotation");
            },(fetchtexterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 10000);
            });
        return true;
        }



    createGroupProclamationAlert(groupid){
        if(this.AlertText=="" || this.AlertText == null){
            this.presentToast("Your Proclamation Text must be filled", 5000);
        }else{
            //store quotation text to database;
            let postdata = {
                creategroupalarmtext: "yes",
                groupid: groupid,
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
                        this.presentToast("proclamation text stored successfully for your group", 5000);
                        this.getGroupAlerts(groupid, 2);
                    }

                }, (storederr)=>{
                    this.dismissLoad();
                    this.presentToast( JSON.stringify(postdata)+" proclamation text not stored for your group "+ storederr, 30000);
                });
            console.log("successful fetch of quotation");
        }

    }

    //display group members;
    viewGroupMembers(){
        this.DisplayMembers = true;
        this.DisplayPrayers = !this.DisplayPrayers;
    }


    //get group alerts;
    getGroupAlerts(groupid, alerttypeid){
        //store quotation text to database;
        let postdata = {};
        if(alerttypeid == null){
            postdata = {
                getgroupallalarms: "yes",
                groupid: groupid
            };
        }else{
            postdata = {
                getgroupalarmsbytype: "yes",
                groupid: groupid,
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
                    this.GroupAlerts = stored.results;
                    this.GroupAlerts.forEach((alert)=>{
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
                this.presentToast("alerts not got for your group "+ storederr, 5000);
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


    //make preayer request;
    addPrayer(prayertext: string){
        if(prayertext == '' || prayertext == ' ' || prayertext.length < 4){
            this.presentToast("please type in your prayer point, atleast a 4 character word ", 3000);
            return false;
        }

        let postdata = {
            addprayer: "yes",
            prayertext: prayertext,
            prayertypeid: this.PrayerTypeId,
            prayergroupid: this.prayergroupid
        };

        this.presentLoading("please wait");
        this.httpservice.postStuff("/api/prayer/index.php", JSON.stringify(postdata))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);

                }else{
                    //if prayer was sent and stored on backend db;
                    let userprayer = {
                        groupname: this.Admin.groupname,
                        prayertext: prayertext,
                        prayertypeid: this.PrayerTypeId,
                        time: new Date("Y m D, h:i:s a"),
                        answered: "",
                        platform: "Prayer Group"
                    };
                    this.storage.get("userprayers")
                        .then((userprayers: Array<any>)=>{
                            if(userprayers){
                                let prayers = userprayers.push(userprayer);
                                this.storage.set("userprayers", prayers)
                                    .then((storedprayers)=>{
                                        this.presentToast("prayers have been saved, would be published on groups wall by the group admin", 5000);
                                    }).catch((storageerr)=>{
                                        this.presentToast(JSON.stringify(storageerr), 5000);
                                    });
                            }else{
                                //if there was no prayers stored earlier;
                                this.storage.set("userprayers", [userprayer])
                                    .then((storedprayers)=>{
                                        this.presentToast("prayers have been saved, would be published on groups wall by the group admin", 5000);
                                    }).catch((storageerr)=>{
                                        this.presentToast(JSON.stringify(storageerr), 5000);
                                    });

                            }
                            //push page to reload prayers;
                            this.pushPage("PrayergroupPage",{"groupid": this.prayergroupid});

                        }).catch((getstorageerr)=>{
                            this.presentToast(JSON.stringify(getstorageerr), 5000);
                        })
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            })
        return true;
    }

    //get prayer followers;
    getPrayerFollowers(prayerid){
        let postdata = {
            getprayerfollowers: "yes",
            prayerid: prayerid
        };

        let modaloptions: any = {
            fetchurl: "/api/prayer/index.php",
            fetchpostdata: postdata
        };
        let modal = this.modalCtrl.create("UsersModalPage",modaloptions);
        modal.present();

    }

    joinPrayer(prayerid, ownerid, prayertext, index){
        //check if user is a pastor;
        if(this.User.roleid == 1){
            let alert = this.alertCtrl.create({
                subTitle: "Prayer Text",
                message: "Speak your word on this person's prayer request",
                inputs: [{
                    name: "prayertext",
                    type: "textarea",
                    label: "prayer text",
                    placeholder: "enter prayer text"
                }],
                buttons: [{
                    text: "Join, With My Word",
                    handler: (data)=>{
                        return this.joinPrayer2(prayerid,ownerid,data.prayertext,index);
                    }
                    },
                    {
                        text: "Join, Without Word",
                        handler: ()=>{
                            return this.joinPrayer2(prayerid,ownerid,prayertext,index);
                        }
                    },
                    {
                        text: "Never Mind",
                        handler: ()=>{
                            return true;
                        }
                    }

                ]

            });
            alert.present();
        }else{
            return this.joinPrayer2(prayerid,ownerid,prayertext,index);

        }
    }


    //join in prayer;
    joinPrayer2(prayerid, ownerid, prayertext, index){

        let postdata = {
            joinprayer:"yes",
            prayerid: prayerid,
            ownerid: ownerid,
            prayeractiontext: prayertext,
            actiontypeid: 1
        };

        this.presentLoading("processing");
        this.httpservice.postStuff("/api/prayer/index.php", postdata)
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);

                }else{
                    this.Prayers[index].noofprayeractions++;
                    this.Prayers[index].isfollowingprayer = 1;
                    this.presentToast(data.message, 5000);
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            })
    }
    //track arrays;
    trackArrayObjects(index, item){
        return item;
    }

    //renege from prayer;
    leavePrayer(prayerid, index: number){
        let postdata = {
            leaveprayer: "yes",
            prayerid: prayerid,
        };

        this.presentLoading("please wait a sec");
        this.httpservice.postStuff("/api/prayer/index.php", postdata)
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast(data.message, 5000);

                }else{
                    this.Prayers[index].noofprayeractions--;
                    this.Prayers[index].isfollowingprayer = 0;

                    this.presentToast(data.message, 5000);
                }

            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            })
    }

    joinGroup(groupid){
        //get prayer groups members
        this.presentLoading("adding you to group");
        this.httpservice.postStuff("/api/prayergroup/index.php",JSON.stringify({"joingroup":"y", "groupid": groupid}))
            .subscribe((data)=>{
                if(data.results == "0"){
                    this.presentToast("Sorry you can not join, this group is not sanctioned  ", 4000);
                }else{
                    this.presentToast("Congrats, You have joined this group  ", 5000);
                    this.IsAMember = true;
                    //add group to usergroupdata on storage;
                    let groupdata = {
                        groupid: groupid,
                        groupname: this.Admin.groupname
                    };
                    this.storage.get("usergroups")
                        .then((grps)=>{
                            if(grps){
                                grps.push(groupdata);
                                this.storage.set("usergroups", [groupdata])
                                    .then((stored)=>{
                                        console.log("group stored");
                                    }).catch((storingerr)=>{
                                        this.presentToast("could not store group in device"+ storingerr, 5000);
                                    })
                            }else{
                                this.storage.set("usergroups", [groupdata])
                                    .then((stored)=>{
                                        console.log("group stored");
                                    }).catch((storingerr2)=>{
                                        this.presentToast("could not get and yet could not store group in device"+ storingerr2, 5000);
                                    })
                            }
                        }).catch((getusergrouperr)=>{
                            this.presentToast("could not get user groups", 4000);
                        })
                }
                this.dismissLoad();
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast("Bad Connection or response",5000);
                this.ErrMessage = " Bad Connection or response";
                console.log(JSON.stringify(reqterr));
            })
    }

    //leave group
    leaveGroup(groupid){
        //get prayer groups members
        this.presentLoading("moving you out this group");
        this.httpservice.postStuff("/api/prayergroup/index.php",JSON.stringify({"leavegroup":"y", "groupid": groupid}))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast("Sorry, this group is not sanctioned  ", 4000);
                }else{
                    this.presentToast("You have left this group", 5000);
                    this.IsAMember = false;
                    //remove group from user groups data;
                    this.presentLoading("now removing group from your data");
                    this.storage.get("usergroups")
                        .then((grps)=>{
                            this.dismissLoad();
                            if(grps){
                                let groups: Array<any> = grps;
                                for(let i=0; i<groups.length; i++){
                                    if(groups[i].groupid == groupid){
                                        groups.splice(i,1);
                                    }
                                }
                                this.storage.set("usergroups",groups)
                                    .then((setusergroup)=>{
                                        console.log("user groups reset");
                                    }).catch((setusergroupserr)=>{
                                        this.presentToast("user groups not reset"+setusergroupserr, 5000);
                                    })
                            }
                        }).catch((getusergroupserr)=>{
                            this.dismissLoad();
                            this.presentToast("unable to get user group data anyways"+getusergroupserr, 5000);
                        })
                }
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response",5000);
                this.ErrMessage = " Bad Connection or response";
                console.log(JSON.stringify(reqterr));
            })
    }


    //navigate to page;
    pushPage(pagename: string, params: any){
        this.navCtrl.push(pagename,params);
    }
}
