import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Color from 'color';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storage: NativeStorage
    ) {
    storage.getItem('theme').then(themename => {
      this.setGlobalCSS(themename);
    });
  }

  setTheme(theme) {
    this.storage.setItem('theme', theme);
  }

  private setGlobalCSS(theme: string) {
    if(theme == 'dark') document.body.classList.toggle('dark', true);
  }

  storedThemename(){
    return this.storage.getItem('theme');
  }
}
