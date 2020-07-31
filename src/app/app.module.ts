import { BrowserModule } from '@angular/platform-browser';
import { JsonpModule, HttpModule } from '@angular/http';

import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpservicesProvider } from '../providers/httpservices/httpservices';
import { IonicStorageModule } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
/*
import { Push } from '@ionic-native/push';
*/
import { FCM } from '@ionic-native/fcm';
/*
import { FileTransfer } from '@ionic-native/file-transfer';
*/
/*
import { BackgroundMode } from '@ionic-native/background-mode';
import { Autostart } from '@ionic-native/autostart';
import { SQLite } from '@ionic-native/sqlite';
*/
import { Vibration } from '@ionic-native/vibration';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';

//import { File } from '@ionic-native/file';


import { MyApp } from './app.component';
import { PrayerservicesProvider } from '../providers/prayerservices/prayerservices';
import { PushactionsProvider } from '../providers/pushactions/pushactions';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    /*BackgroundMode,
    Autostart,
    SQLite,
    File,*/
    FileTransfer,
    Camera,
    FCM,
    Vibration,
    SpeechRecognition,
    LocalNotifications,
    TextToSpeech,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpservicesProvider,
    PrayerservicesProvider,
    PushactionsProvider
  ]
})
export class AppModule {}
