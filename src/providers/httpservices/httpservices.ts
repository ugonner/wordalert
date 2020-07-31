import { Injectable } from '@angular/core';
/*import { ToastController } from  from 'ionic-angular';*/
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';

/*
  Generated class for the HttpservicesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpservicesProvider {
    //used https cos http protocol did not allow post method to external server;
  /*public hostdomain = "http://localhost";
  */public hostdomain = "https://smallate.com.ng";
  public localhosturl = "http://agmall.com.ng";
  public bibleapi = "http://labs.bible.org";
  public headers = new Headers({
      "Content-Type": "application/json"
  });

  public requestoptions = new RequestOptions({
      headers: this.headers,
      withCredentials: true
  });

  constructor(public http: Http,  /*private toastCtrl: ToastController*/) {
    console.log('Hello HttpservicesProvider Provider');
  }

  postStuff(uri: String, postdata): Observable<any>{
      let url = this.hostdomain + uri;

      return this.http.post(url,postdata, this.requestoptions).map(res=> <any>res.json());
  }

    postStuffRawOutput(uri: String, postdata): Observable<any>{
        let url = this.hostdomain + uri;
        return this.http.post(url,postdata,this.requestoptions);

    }

    getBibleQuotation(uri: String): Observable<any>{
        let url = this.bibleapi + uri;
        return this.http.get(url).map((res)=>{return <any>res.json()});
    }


    //using spinners as loading detectors;
    public LoadingMessage: string;
    public DisplaySpinner: boolean;

    presentLoading(str){
        this.DisplaySpinner = true;
        this.LoadingMessage = str;
    }
    dismissLoad(){
        this.DisplaySpinner = false;
    }
/*
    presentToast(message, duration){
        let toast = this.toastCtrl.create({
            "message":message,
            "position":"middle",
            "duration": duration
        });
        toast.present();

    }*/
}
