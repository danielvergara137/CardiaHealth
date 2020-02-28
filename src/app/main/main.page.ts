import { Component, OnInit, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Router } from '@angular/router';
import { ToastController, Platform } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { LoadingController } from '@ionic/angular';
import { PermissionsService } from '../services/permissions.service';
import { ThemeService } from '../services/theme.service';
import { User } from '../models/user';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  user: User;
  devices: any[] = [];
  statusMessage: string;

  constructor(private ble: BLE,
              public plt: Platform,
              private ngZone: NgZone,
              private router: Router,
              public toastCtrl: ToastController,
              private dataService: DataService,
              private theme: ThemeService,
              public loadingController: LoadingController,
              private permissionService: PermissionsService) { 

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.permissionService.checkBluetooth();
    this.permissionService.checkLocation();
    this.scan();
  }

  scan() {
    this.setStatus('Buscando dispositivos');
    this.devices = []; 
    this.presentLoading();
    this.ble.scan([], 3).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 2000, 'Escaneo completado');
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Buscando dispositivos',
      duration: 2100
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      if(device.name != null) this.devices.push(device);
    });
  }

  // If location permission is denied, you'll end up here
  async scanError(error) {
    this.setStatus('Error ' + error);
    const toast = await this.toastCtrl.create({
      header: 'Toast header',
      message: 'Click to Close',
      position: 'top'
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }
  
  deviceSelected(name: string, id: string) {
    console.log(JSON.stringify(name) + ' selected');
    let navextras = {
      name: name,
      id: id
    };
    console.log("name: "+ name + " id: "+ id)
    this.dataService.setData(42, navextras);
    this.router.navigateByUrl("/detail/42");
  }

}
