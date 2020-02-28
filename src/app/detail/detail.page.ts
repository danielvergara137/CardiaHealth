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
  buffer: number[] = new Array(200);
  data: number[] = new Array();
  enviando: boolean = false;
  //@ViewChild('canvas', { static: false }) canvasEl : ElementRef;
 // private _CANVAS  : any;
  //private _CONTEXT : any;
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

  ngOnInit() {
    this.connect(this.device.id);
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
                ticks: {
                  display: false,
                  min: 0,
                  max: 4000,
                  fontColor: "black",
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
      }
    )
    
  }

  connect(id: string){
    console.log('conectando')
    this.presentLoading('Conectando', 1500);
    this.ble.connect(id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );
    console.log('conexion terminada')
  }

  errorConnect(message, id){
    console.log(message);
    this.onDeviceDisconnected(this.device);
    this.ble.disconnect(id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.device['name'])),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.device['name']))
    )
  }
/*
  ionViewDidEnter(){
    this._CANVAS 	    = this.canvasEl.nativeElement;
    this._CANVAS.width  	= 400;
    this._CANVAS.height 	= 200;

    this.initialiseCanvas();
    this.draw();
  }

  initialiseCanvas(){
    if(this._CANVAS.getContext){
      this.setupCanvas();
    }
  }

  setupCanvas(){
    this._CONTEXT = this._CANVAS.getContext('2d');
    this._CONTEXT.fillStyle = "#c0c0c0";
    this._CONTEXT.fillRect(0, 0, 400, 200);
  }

  clearCanvas(){
    this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
    this.setupCanvas();
  }

  draw(){
    this.clearCanvas();
    this._CONTEXT.beginPath();
    this._CONTEXT.moveTo(0, this._CANVAS.height/2);
  }*/

  drawChart(data){
    this.ngZone.run(() => {
      var ejey = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
      //if(this.chart.data.datasets[0].data.length == 200){
      this.chart.data.datasets[0].data.shift();
      //}
      this.chart.data.datasets[0].data.push(ejey);
      this.chart.update()
      if( this.enviando && this.data.length < 3000){
        this.data.push(ejey);
        //console.log("data push: " + ejey)
        //console.log("tam data: " + this.data.length)
      }
    });
  }
/*
  drawBuffer(data){
    this.draw();
    var ejey = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
    this.buffer.shift();
    this.buffer.push(ejey);
    if( this.enviando && this.data.length < 3000){
      this.data.push(ejey);
      console.log("data push: " + ejey)
      console.log("tam data: " + this.data.length)
    }
    this.ejex = 0;
    for(var i=0; i < this.buffer.length; i++){
      var y = this._CANVAS.height - this.buffer[i]/20;
      this._CONTEXT.lineTo(this.ejex, y);
      this._CONTEXT.lineWidth = 0.5;
      this._CONTEXT.strokeStyle = '#000000';
      this.ejex += 2;
    }
    this._CONTEXT.stroke();
  }

  drawLine(data){    
    //this.mostrar(buffer);
    //console.log(buffer)
    var ejey = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
    //console.log("x: " + this.ejex + " width: " + this._CANVAS.width)
    if( this.enviando && this.data.length < 3000){
      this.data.push(ejey);
      console.log("data push: " + ejey)
      console.log("tam data: " + this.data.length)
    }
    if(this.ejex < this._CANVAS.width){
      this.buffer.push(ejey);
      var y = this._CANVAS.height - ejey/20;
      this._CONTEXT.lineTo(this.ejex, y);
      this._CONTEXT.lineWidth = 0.1;
      this._CONTEXT.strokeStyle = '#000000';
      this._CONTEXT.stroke();
      this.ejex += 2;
      //console.log("x: " + this.ejex + " y: " + y)
    }
    else if(this.ejex >= this._CANVAS.width){
      this.buffer = []
      this.buffer.push(ejey);
      this.draw();
      this.ejex = 0;
    }
  }*/

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('Dispositivo conectado');
      this.peripheral = peripheral;
      console.log('peripheral: ' + JSON.stringify(peripheral, null, 2))
    });
  }

  async onDeviceDisconnected(peripheral) {
    console.log('no conectado')
    this.setStatus('Dispositivo desconectado');

    this.toastMessage('Periferico desconectado', 2000, 'middle')
  }

  async toastMessage(message, duration, position){
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position
    });
    toast.present();
  }

  reconect(){
    console.log('reconectando') 
    this.ble.isConnected(this.device['id']).then(
      () => this.setStatus('Dispositivo conectado'),
      () => this.connect(this.device['id'])
    );
  }

  async presentLoading(mensaje, duracion) {
    const loading = await this.loadingController.create({
      message: mensaje,
      duration: duracion
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }

  setStatus(message: string) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  notificar(device, service_uuid, characteristic_uuid){
    if(characteristic_uuid == '6e400003-b5a3-f393-e0a9-e50e24dcca9e'){
      this.ble.startNotification(device, service_uuid, characteristic_uuid).subscribe(
        dato => {
          this.drawChart(dato);
          //this.drawBuffer(dato);
        }
      );
    }
    else if(characteristic_uuid == '82907e6e-90ce-4695-ba9b-1d4e460ee136'){
      this.ble.startNotification(device, service_uuid, characteristic_uuid).subscribe(
        dato => this.mostrarestado(dato)
      );
    }
  }

  mostrarestado(data){
    var estado = String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
    this.ngZone.run(() => {
      this.estado = estado;
    });
  }

  prepararenvio(){
    this.enviando = true;
    this.presentLoading('Recopilando datos', 31000);
    setTimeout(this.enviar.bind(this), 31000);
  }

  enviar(){
    this.presentLoading('Enviando datos', 20000);
    let stringtowrite: string = "";

    console.log(this.data)

    for(var i = 0; i < this.data.length; i++){
      stringtowrite += this.data[i].toString() + '\n';
    }

    this.enviando = false;
    this.data =[] ;

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
                    this.toastMessage('Datos enviados', 1500, 'bottom')
                  },
          error => this.toastMessage('Error al enviar los datos', 2000, 'bottom')
        );
      },
      (error) => this.toastMessage('Error al enviar los datos', 2000, 'bottom')
    );
  }

}