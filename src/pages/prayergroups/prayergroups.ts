import { Component } from '@angular/core';
import { ToastController,IonicPage, NavController,NavParams, AlertController } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PrayergroupsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-prayergroups',
  templateUrl: 'prayergroups.html',
})
export class PrayergroupsPage {
    public UserPrayerGroups: any = [];
    public PrayerGroups: any = [];
    public ClassMessage: string;
    public DisplayUserGroups: boolean = true;
    public DisplayAllGroups: boolean = false;
    public DisplaySpinner: boolean;
    public LoadingMessage: string;
    constructor(public navCtrl: NavController, public navParams: NavParams,
                private alertCtrl: AlertController, private toastCtrl: ToastController, private http: HttpservicesProvider,
        private storage: Storage) {
    }

    /*ionViewDidLoad() {
        console.log('ionViewDidLoad PrayergroupPage');
    }*/

    ionViewDidEnter() {
        this.storage.get("usergroups")
            .then((usergrps)=>{
                if(usergrps){
                    this.UserPrayerGroups = usergrps;
                }else{
                    this.presentToast("You do not belong to any group, view all groups to join one", 5000);
                }
            }).catch((getusergrpserr)=>{
                this.presentToast("unable to access device storage", 5000);
            });
    }

    //retrieve all groups;
    retrieveUserPrayerGroups(){
        this.presentLoading("fetching your groups, please wait");
        this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({getusergroups: "yes"}))
            .subscribe((data)=>{
                this.dismissLoad();
                let results = data.results;
                if(results == "0"){
                    this.presentToast(data.message, 5000);
                }else{
                    this.UserPrayerGroups = results;
                    this.DisplayAllGroups = false;
                    this.DisplayUserGroups = true;
                    this.storage.set("usergroups",results)
                        .then(()=>{
                            this.presentToast("your prayer groups restored and stored", 5000);
                        }).catch((storeerr)=>{
                            this.presentToast("unable to store your prayer groups on your device try again", 5000);
                        })
                }
            },(err)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response", 5000);
            })
    }

    //display user groups;
    displayUserPrayerGroups(){
        this.DisplayAllGroups = false;
        this.DisplayUserGroups = true;
    }

    //get all prayer groups;
    getAllPrayerGroups(){
        this.storage.get("bibleappuserdata")
            .then((userdata)=>{
            let userid = userdata.id;
            //get all groups
            this.presentLoading("getting groups, biko wait a sec ... ");
            this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({getgroups:"y"}))
                .subscribe((data)=>{
                    this.dismissLoad();
                    if(data.results == 0){
                        this.presentToast(data.message, 5000);
                    }else{
                        let resultsarray: Array<any> = data.results;
                        resultsarray.forEach((grp)=>{
                            if(grp.adminid == userid){
                                grp.isAdmin = 1;
                            }else{
                                grp.isAdmin = 0;
                            }
                        });

                        this.PrayerGroups = resultsarray;
                        this.DisplayUserGroups = false;
                        this.DisplayAllGroups = true;
                    }
                    console.log(data.results+" got success");
                },(err)=>{
                    this.dismissLoad();
                    this.presentToast(" Bad Connection or response", 5000);
                    console.log("unable to get to server"+ err);
                })
        })
            .catch((userdataerr)=>{
                this.presentToast("unable to access your device for data ", 5000);
                console.log("unable to access your device for data"+ userdataerr);
            });

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

    createGroup(name) {

        this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({addgroup:"y", groupname: name}))
            .subscribe((res)=>{
                if(res.results == 0){
                    this.presentToast("FAILED "+res.message+" "+res.results, 5000);
                }else{
                    this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({getgroups:"y"}))
                        .subscribe((data)=>{
                            if(data.results == 0){
                                this.presentToast(data.message,5000);
                            }else{
                                this.presentToast(name+" created successfully", 5000);
                                this.PrayerGroups = data.results;
                            }
                        },(err)=>{
                            this.presentToast(name+" created successfully", 5000);

                        });
                }
                console.log(res.results+" got success");
            },(err)=>{
                this.presentToast(" Bad Connection or response", 5000);
                console.log("unable to get to server"+ err);
            });
    }

    //delete group

    deleteGroup(groupid, groupindex) {

        this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({removegroup:"y", groupid: groupid}))
            .subscribe((res)=>{
                if(res.results == 0){
                    this.ClassMessage = "could not delete group "+res.message;
                    console.log("FAILED "+res.message+" "+res.results)
                }else{
                    this.PrayerGroups.splice(groupindex,1);
                    this.presentToast("Success deleted group",5000);
                }
                console.log(res.results+" got success");
            },(err)=>{
                this.ClassMessage = " Bad Connection or response";
                console.log("unable to get to server"+ err);
            });
    }

//preent create group alert
    presentCreateGroupAlert(){
        let alert = this.alertCtrl.create({
            "title": "Crrate Group",
            "message": "You can create a group if you are so permitted ?",
            "inputs":[
                {
                    name: "names",
                    type: "text",
                    placeholder: "Group Name (important)"
                }
            ],
            "buttons":[
                {
                    "text": "Create Group",
                    "handler": (data)=>{ return this.createGroup(data.names)}
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

//PRESENT DELETE ALERT
    presentdeleteGroupAlert(groupid, grpindex){
        let alert = this.alertCtrl.create({
            "title": "Delete Group",
            "message": "You can delete a group if you are so permitted, Do You Wish to continue ?",

            "buttons":[
                {
                    "text": "Delete Group",
                    "handler": ()=>{
                        return this.deleteGroup(groupid, grpindex)
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



//PRESENT leave group ALERT
    presentLeaveGroupAlert(groupid, grpindex){
        let alert = this.alertCtrl.create({
            "title": "Leave Group",
            "message": "You sure want to leave this group ?",

            "buttons":[
                {
                    "text": "Leave Group",
                    "handler": ()=>{
                        return this.leaveGroup(groupid, grpindex)
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

    //leave group
    leaveGroup(groupid, groupindex){
        //get prayer groups members
        this.presentLoading("removing you out of this group");
        this.http.postStuff("/api/prayergroup/index.php",JSON.stringify({"leavegroup":"y", "groupid": groupid}))
            .subscribe((data)=>{
                this.dismissLoad();
                if(data.results == "0"){
                    this.presentToast("Sorry, this group is not sanctioned  ", 4000);
                }else{
                    this.presentToast("You have left this group", 5000);
                    //remove group from user groups data;
                    this.storage.get("usergroups")
                        .then((grps)=>{
                            if(grps){
                                let groups: Array<any> = grps;
                                for(let i=0; i<groups.length; i++){
                                    if(groups[i].groupid == groupid){
                                        groups.splice(i,1);
                                    }
                                }
                                this.presentLoading("now removing group from your data");
                                this.storage.set("usergroups",groups)
                                    .then((setusergroup)=>{
                                        this.dismissLoad();
                                        console.log("user groups reset");
                                    }).catch((setusergroupserr)=>{
                                        this.dismissLoad();
                                        this.presentToast("user groups not reset"+setusergroupserr, 5000);
                                    })
                            }
                        }).catch((getusergroupserr)=>{
                            this.presentToast("unable to get user group data anyways"+getusergroupserr, 5000);
                        });
                    //now remove from usergroups array;
                    this.UserPrayerGroups.splice(groupindex,1);
                }
            },(reqterr)=>{
                this.dismissLoad();
                this.presentToast(" Bad Connection or response",5000);
                console.log(JSON.stringify(reqterr));
            })
    }


//track notifications displayed at DOM;
    trackGroup(index, item){
        return index;
    }


    //navigate to page;
    pushPage(pagename: string, params: any){
        this.navCtrl.push(pagename,params);
    }
}
