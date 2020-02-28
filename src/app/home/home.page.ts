import { Component } from '@angular/core';
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

  constructor(
    private router: Router, 
    public formBuilder: FormBuilder,
    private authService: AuthService) { }

  ionViewWillEnter() {
    this.authService.getToken().then(() => {
      if(this.authService.isLoggedIn) {
        this.router.navigateByUrl('/main');
      }
    });
  }

  login(form: NgForm) {
    if(form.invalid) console.log("Ingrese usuario y contraseña")
    else{
      if(this.authService.login(form.value.username, form.value.password)){
        this.router.navigateByUrl('/main');
      }   
    }
  }
}
