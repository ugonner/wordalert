import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, App } from 'ionic-angular';
import { HttpservicesProvider } from '../../providers/httpservices/httpservices';
import { PushactionsProvider } from '../../providers/pushactions/pushactions';
import { PrayerservicesProvider } from '../../providers/prayerservices/prayerservices';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html',
})
export class LoginModalPage {

  public Logindata = {
       email: '',
      password: ''
  };

  public  Regdata = {"register":'reg', "email": '', "password": '', "firstname": '', "surname": '', "mobile": '', "public": '', "state": '', "lga": ''};
  public Regdatamsg = {"email": '', "password": '', "mobile": '', "surname":'', "firstname": '', "public": '', "state": '', "lga": ''};
  public displaypassword: boolean = false;
  public TinyMessage: String = '';
  public loginform: boolean = true;
  public CanLeave: any =  false;
  public PushId: any;

  public DisplaySpinner: boolean;
  public LoadingMessage: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public httpservice: HttpservicesProvider
      ,private storage: Storage, private app: App, private viewCtrl: ViewController,
      private pushservice: PushactionsProvider, private prayerservice: PrayerservicesProvider) {
  }

  ionViewDidLoad() {
      this.pushservice.getFCMToken()
          .then((token)=>{
              this.PushId = token;
          }).catch(()=>{})
    console.log('ionViewDidLoad LoginModalPage');
  }


  /*ionViewCanLeave(){
     return this.CanLeave;
  }*/

  toggleForms(){
      this.loginform = !(this.loginform);
      console.log(this.loginform + ' abi');
  }


  presentLoading(str){
      this.DisplaySpinner = true;
      this.LoadingMessage = str;
  }

  dismissLoad(){
      this.DisplaySpinner = false;
  }


  loginUser(){
      let postdata: any;
      if(this.Logindata.email == '' || this.Logindata.password == ''){
          this.TinyMessage = "you can not submit an empty value";
          return false
      }else{
          postdata = {
              "log": 'login',
              "login":'yes',
              email: this.Logindata.email,
              password: this.Logindata.password
          };

          if(this.PushId == null || this.PushId == 'undefined'){
              console.log('no pushid or token');
          }else{
              postdata.pushid = this.PushId;
          }
          /*this.TinyMessage = JSON.stringify(postdata);*/

          this.presentLoading("loggin details, please wait");
          this.httpservice.postStuff("/api/user/index.php",
                  JSON.stringify(postdata))
                      .subscribe((data)=>{
                  if(data.results == "0"){
                      this.TinyMessage = data.message;
                      console.log("got there");
                  }else{
                      let userdata = {
                          "id": data.results.id,
                          "email": data.results.email,
                          "password": data.results.password,
                          "firstname": data.results.firstname,
                          "surname": data.results.surname,
                          "state": data.results.state,
                          "lga": data.results.lga,
                          "mobile": data.results.mobile,
                          "public": data.results.public,
                          "roleid": data.results.roleid,
                          "functionid": data.results.functionid,
                          "rolename":data.results.rolename
                      };
                      this.storage.set("bibleappuserdata",userdata)
                          .then(dat=>{
                              this.CanLeave = true;
                              this.viewCtrl.dismiss();
                              let app = this.app.getRootNav();
                              app.push("MainpagePage");
                              console.log(data.results.firstname + " " + " data stored");
                          }).catch(err=>{
                              console.log(err);
                          });
                      console.log(data.message+' ' + data.results+' ' + data + ' got to server with result');
                  }
              },(err)=>{
                  this.TinyMessage = ' Error In Requsest';
                  console.log(err + 'error in request');
              });
          this.dismissLoad();
          return true;
      }
  }

  registerUser(){
      if((this.Regdata.email == '') || (this.Regdata.password == '') || (this.Regdata.mobile == '')
          || (this.Regdata.firstname == '')){
          this.TinyMessage = " All fields are required";
          this.prayerservice.presentToast(this.TinyMessage,5000);
      }
      else{
        let postdata;
          postdata = {
              "register":'yes',
              "email": this.Regdata.email,
              "password": this.Regdata.password,
              "firstname": this.Regdata.firstname,
              "surname": 'NA',
              "mobile": this.Regdata.mobile,
              "public": (this.Regdata.public ? "Y": "N")
          };

          if(this.PushId == null || this.PushId == 'undefined'){
              console.log('ok');
          }else{
              postdata.pushid = this.PushId;
          }
        this.presentLoading("Uploading and Verifying Your Detail, Please Wait A Second")
        this.httpservice.postStuff("/api/user/index.php",postdata)
              .subscribe((res)=>{
               /*alert(res["_body"]);*/
                  if(res.results == "0" || res.results == ''){
                      this.TinyMessage = res.message;
                      console.log("registration failed" + res +' '+ res.message);
                      this.prayerservice.presentToast(res.message,5000);
                  }else{
                      let userdata = {
                        "id": res.results.id,
                        "email": res.results.email,
                        "password": res.results.password,
                        "firstname": res.results.firstname,
                        "surname": res.results.surname,
                        "mobile": res.results.mobile,
                        "state": res.results.state,
                        "lga": res.results.lga,
                        "public": res.results.public,
                        "roleid": res.results.roleid,
                        "functionid": res.results.functionid,
                        "rolename": res.results.rolename,
                        "profilepic": res.results.profilepic
                      };
                      this.storage.set("bibleappuserdata", userdata)
                          .then(()=>{
                              this.CanLeave = true;
                              this.viewCtrl.dismiss();
                              let app = this.app.getRootNav();
                              app.push("WelcomePage");
                              this.TinyMessage = this.Regdata.firstname+", you have been registered successfully ";
                              console.log(this.Regdata.firstname + 'successfully saved to memory');})
                          .catch(err=>{
                              this.TinyMessage = 'Unable to get user data from device storage';
                              console.log(err);
                          });
                  }
              }, (err)=>{
                this.TinyMessage = err+'  Error in connection for request, try again';
                console.log(err);
            });
       this.dismissLoad();
      }
  }
}
