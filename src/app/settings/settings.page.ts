import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  toggle:any;
  currentTheme: string;
  checked: boolean;
  @ViewChild("toggleElement", {static: false}) ref: ElementRef;

  constructor(
    private theme: ThemeService,
    private storage: NativeStorage) { 
    
  }

  ngOnInit() {
    this.storage.getItem('theme').then(
      themename => this.checkToggle(themename),
      error => console.log('no theme ' +  error)
    );
  }

  checkToggle(themename){
    this.currentTheme = themename
    console.log("initial Theme: " + this.currentTheme)
    if(this.currentTheme == 'dark'){
      this.checked = true;
    }
    else{
      this.checked = false;
    }
  }

  changeTheme(e){
    document.body.classList.toggle('dark', e.checked);
    if(e.checked) this.theme.setTheme('dark')
    else this.theme.setTheme('')

    /*
    this.storage.getItem('themename').then(
      themename => this.currentTheme = themename
    );
    console.log(e.checked)
    console.log("Theme: " + this.currentTheme)
    if(e.checked == false){
      console.log('light theme')
      this.theme.setTheme('', '');

    }
    else{
      console.log('dark theme')
      this.theme.setTheme(themes['night'], 'night');
    }*/
  }

}