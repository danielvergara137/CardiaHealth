import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  private navigate: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private menu: MenuController,
    private router: Router
  ) {
    this.sideMenu();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.authService.getToken();
    });
  }

  sideMenu()
  {
    this.navigate =
    [
      {
        title : "Home",
        url   : "/main",
        icon  : "home"
      },
      {
        title : "Profile",
        url   : "/profile",
        icon  : "person"
      },
      {
        title : "Settings",
        url   : "/settings",
        icon  : "settings"
      },
    ]
  }

  logout() {
    if(this.authService.logout()){
      this.menu.close();
      this.router.navigateByUrl('/home');
    }
  }

}
