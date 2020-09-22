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

  //Cuando se entra a la pagina se verifican los permisos necesarios para el plugin de BLE y se inicia el scan
  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.permissionService.checkBluetooth();
    this.permissionService.checkLocation();
    this.scan();
  }

  //Se actualiza el estado mostrado en el footer, se muestra un indicador de progreso y se inicia el scan
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

  //Utilizado para mostrar el indicador de progreso del scan
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Buscando dispositivos',
      duration: 2100
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  //Cuando se descubre un dispositivo, este se agrega al array devices para mostrarlo en pantalla
  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      if(device.name != null) this.devices.push(device);
    });
  }

  //Si no existen los permisos para el uso del bluetooth se muestra un error
  async scanError(error) {
    this.setStatus('Error ' + error);
    const toast = await this.toastCtrl.create({
      header: 'Toast header',
      message: 'Click to Close',
      position: 'top'
    });
    toast.present();
  }

  //Se actualiza el mensaje del footer
  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }
  
  //Cuando se selecciona un dispositivo se abre su pagina de detalle y se envian sus parametros
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

  tutorial(){
    this.router.navigateByUrl("/tutorial");
  }

}
