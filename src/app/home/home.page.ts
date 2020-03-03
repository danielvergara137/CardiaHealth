import { Component, NgZone } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public loginForm: FormGroup;
  private alert: string;

  constructor(
    private router: Router, 
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private ngZone: NgZone) { 
      this.alert = ' ';
    }

  //Cuando se carga la pagina se consulta al servicio auth si es que el usuario permanece logeado en la aplicación,
  //si aún está logeado se carga directamente la página principal
  ionViewWillEnter() {
    this.authService.getToken().then(() => {
      if(this.authService.isLoggedIn) {
        this.router.navigateByUrl('/main');
      }
    });
  }

  //Luego de completar el formulario de login, se verifica que ambos campos tengan información y se carga la página principal
  login(form: NgForm) {
    if(form.invalid){
      this.ngZone.run(() => {
        this.alert = 'Ingrese usuario y contraseña';
      });
      console.log("Ingrese usuario y contraseña")
    } 
    else{
      this.ngZone.run(() => {
        this.alert = ' ';
      });
      if(this.authService.login(form.value.username, form.value.password)){
        this.router.navigateByUrl('/main');
      }   
    }
  }
}
