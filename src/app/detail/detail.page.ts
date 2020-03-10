import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { BLE } from '@ionic-native/ble/ngx';
import { LoadingController } from '@ionic/angular';
import { AwsService } from '../services/aws.service';
import { ThemeService } from '../services/theme.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  peripheral: any = {};
  statusMessage: string;
  estado: string;
  temp: string;
  buffer: number[] = new Array(200);
  data: number[] = new Array();
  enviando: boolean = false;
  recibiendodatos: boolean = false;
  private device : any;
  private ejex : any;
  public chart: any = null;

  constructor(private ble: BLE,
              private toastCtrl: ToastController,
              private route: ActivatedRoute,
              private awsProvider: AwsService,
              private theme: ThemeService,
              private loadingController: LoadingController,
              private ngZone: NgZone) { 

    this.ejex = 0;
    this.buffer.fill(2000, 0, 200);
    //console.log("Buffer: " + this.buffer)
    //console.log("Data: " + this.data)

    if (this.route.snapshot.data['special']) {
      this.device = this.route.snapshot.data['special'];
    }
    console.log("device: " + this.device.name)
    console.log("id device: " + this.device.id)

    this.setStatus('Conectando a ' + this.device.name || this.device.id);

    this.estado = "";
  }

  //Inicia la conexión al dispositivo y fija los parámetros del gráfico del ECG
  ngOnInit() {
    let colorline = '';
    this.theme.storedThemename().then(
      resp => {
        console.log(resp)
        if(resp == 'dark'){
          colorline = '#ffffff'
        }
        else colorline = '#000000'

        this.chart = new Chart('realtime', {
          type: 'line',
          data: {
            labels: new Array(200),
            datasets: [
              {
              label: 'Data',
              fill: false,
              data: new Array(200),
              backgroundColor: colorline,
              borderColor: colorline
              }
            ]
          },
          options: {
            
            animation: {
              duration: 100 // general animation time
            },
            hover: {
              animationDuration: 100 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 100, // animation duration after a resize
            
            elements: {
              line: {
                borderWidth: 1,
                tension: 0 // disables bezier curves
              },
              point: {
                radius: 0
              }
            },
            tooltips: {
              enabled: false
            },
            legend: {
              display: false,
              position: 'bottom',
              labels: {
                fontColor: 'black'
              }
            },
            scales: {
              yAxes: [{
                gridLines: {
                  color: colorline,
                  lineWidth: 0.5,
                  zeroLineColor: colorline
                },
                ticks: {
                  display: false,
                  min: 0,
                  max: 4000,
                  fontColor: colorline,
                  beginAtZero: true
                }
              }],
              xAxes: [{
                gridLines: {
                  display: false
                },
                ticks: {
                  display: false,
                  maxTicksLimit: 50,
                  fontColor: "black",
                  beginAtZero: true
                }
              }]
            }
          }
        });
      },
      error => console.log('error grafica ' + error)
    )
    //this.connect(this.device.id)
    this.preconnecttwo(this.device.id);
  }

  preconnect(id: string){
    this.presentLoading('Conectando', 2500);
    this.ble.scan([], 2).subscribe(
      peripheral => {
        console.log(JSON.stringify(peripheral))
        if (peripheral.id == id) this.connect(id)
      }
    )
  }

  preconnecttwo(id:string){
    this.presentLoading('Conectando', 2500);
    this.ble.scan([], 2).subscribe(
      peripheral => {
        console.log(JSON.stringify(peripheral, null, 2))
      }
    );
    setTimeout(this.connect.bind(this), 2000, id);
  }

  //Conecta la app al dispositivo mediante bluetooth
  connect(id: string){
    //this.presentLoading('Conectando', 1000);
    console.log('conectando')
    this.ble.connect(id).subscribe(
      peripheral => this.onConnected(peripheral),
      error => this.onDeviceDisconnected(error)
    )
  }


  errorConnect(message, id){
    console.log(message);
    this.onDeviceDisconnected(this.device);
    this.ble.disconnect(id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.device['name'])),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.device['name']))
    )
  }

  //Dibuja el gráfico luego de agregar el último dato recibido
  drawChart(data){
    this.ngZone.run(() => {
      var ejey = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
      this.chart.data.datasets[0].data.shift();
      this.chart.data.datasets[0].data.push(ejey);
      this.chart.update()
      if( this.enviando && this.data.length < 3000){
        this.data.push(ejey);
        //console.log("data push: " + ejey)
        //console.log("tam data: " + this.data.length)
      }
    });
  }

  //Si la conexión tiene exito se fija el status del footer
  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('Dispositivo conectado');
      this.peripheral = peripheral;
      console.log('peripheral: ' + JSON.stringify(peripheral, null, 2))
    });
  }

  //Caundo el dispositivo de desconecta, se actualiza el estado y se muestra un mensaje
  async onDeviceDisconnected(peripheral) {
    console.log('no conectado')
    this.setStatus('Dispositivo desconectado');

    this.toastMessage('Periferico desconectado', 2000, 'middle')
  }

  //Muestra con mensaje en pantalla mediante el ToastController
  async toastMessage(message, duration, position){
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position
    });
    toast.present();
  }

  //Si el dispositivo está conectado de actualiza el mensaje del footer, si no se conecta 
  reconect(){
    console.log('reconectando') 
    this.ble.isConnected(this.device['id']).then(
      () => this.setStatus('Dispositivo conectado'),
      () => this.preconnect(this.device['id'])
    );
  }

  //Utilizado para mostrar un indicador de progreso en pantalla
  async presentLoading(mensaje, duracion) {
    const loading = await this.loadingController.create({
      message: mensaje,
      duration: duracion
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  // Desconecta el dispositivo cuando se abandona la pagina
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }

  //Actualiza el mensaje del footer
  setStatus(message: string) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  //Inicia las notificaciones para la caracteristica seleccionada
  notificar(device, service_uuid, characteristic_uuid){
    if(characteristic_uuid == '6e400003-b5a3-f393-e0a9-e50e24dcca9e' || characteristic_uuid == '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'){
      this.ble.startNotification(device, service_uuid, characteristic_uuid).subscribe(
        dato => {
          this.drawChart(dato);
          this.recibiendodatos = true;
        }
      );
    }
    else if(characteristic_uuid == '82907e6e-90ce-4695-ba9b-1d4e460ee136' || characteristic_uuid == '82907E6E-90CE-4695-BA9B-1D4E460EE136'){
      console.log('notif estado')
      this.ble.startNotification(device, service_uuid, characteristic_uuid).subscribe(
        dato => this.mostrarestado(dato)
      );
    }
    else if(characteristic_uuid == 'd6a8b9c2-be5a-48e8-a77c-c6fbbaf5fd9b' || characteristic_uuid == 'D6A8B9C2-BE5A-48E8-A77C-C6FBBAF5FD9B'){
      console.log('notif temp')
      this.ble.startNotification(device, service_uuid, characteristic_uuid).subscribe(
        dato => this.mostrartemp(dato)
      );
    }
  }

  //Actualiza el valor mostrado en pantalla del estado del paciente
  mostrarestado(data){
    var estado = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
    //console.log("recibido estado: " + estado)
    this.ngZone.run(() => {
      this.estado = estado;
    });
  }

  //Actualiza el valor mostrado en pantalla de la temperatura del paciente
  mostrartemp(data){
    var temp = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
    console.log('recibido temp: ' + temp)
    this.ngZone.run(() => {
      this.temp = temp + '°C';
    });
  }

  //Verifica que se estén recibiendo datos del dispositivo y empieza a recopilarlos
  prepararenvio(){
    if(this.recibiendodatos){
      this.enviando = true;
      this.presentLoading('Recopilando datos', 31000);
      setTimeout(this.enviar.bind(this), 31000);
    }
    else this.toastMessage('Active Ver señal de ECG antes de enviar', 2000, 'middle');
  }

  //Registra el examen en la plataforma web y luego envia los datos del ECG a AWS S3
  enviar(){
    this.presentLoading('Enviando datos', 10000);
    let stringtowrite: string = "";

    console.log(this.data)

    let len = this.data.length;

    for(var i = 0; i < len; i++){
      stringtowrite += this.data[i].toString();
      if (i < len - 1 ) stringtowrite += '\n';
    }

    this.enviando = false;
    this.data = [] ;

    this.awsProvider.uploadtoplatform(' ', 1, this.peripheral.id).subscribe( 
      (resp) => {
        console.log(resp)
        var thenum = resp.replace( /^\D+/g, '');
        let type = 'txt';
        let newName = thenum + '/medicion' + '.' + type;
        console.log("newname: " + newName )

        this.awsProvider.uploadtoS3(newName, 'text/plain', {'content' : stringtowrite}).subscribe(
          resp => { console.log('archivo enviado');
                    this.loadingController.dismiss();
                    this.toastMessage('Datos enviados', 1500, 'middle')
                  },
          error => this.toastMessage('Error al enviar los datos', 2000, 'middle')
        );
      },
      (error) => this.toastMessage('Error al enviar los datos', 2000, 'middle')
    );
  }

}