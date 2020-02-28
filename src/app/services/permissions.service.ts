import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  platform: string;

  constructor(private ble: BLE,
              private location: LocationAccuracy,
              private plt: Platform,
              private diagnostic: Diagnostic) {

  }

  
  checkBluetooth(){
    this.ble.isEnabled().then(
      () => console.log('Bluetooth Enabled'),
      () => this.ble.enable()
    );
  }

  checkLocation(){
    this._makeRequest();
  }

  onError(error) {
    console.error("The following error occurred: " + error);
  }

  handleLocationAuthorizationStatus(status) {
    switch (status) {
        case this.diagnostic.permissionStatus.GRANTED:
            if(this.plt.is("ios")){
              this.onError("Location services is already switched ON");
            }else{
              this._makeRequest();
            }
            break;
        case this.diagnostic.permissionStatus.NOT_REQUESTED:
            this.requestLocationAuthorization();
            break;
        case this.diagnostic.permissionStatus.DENIED:
            if(this.plt.is("android")){
              this.onError("User denied permission to use location");
            }else{
              this._makeRequest();
            }
            break;
        case this.diagnostic.permissionStatus.DENIED_ALWAYS:
            // Android only
            this.onError("User denied permission to use location");
            break;
        case this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
            // iOS only
            this.onError("Location services is already switched ON");
            break;
    }
}

requestLocationAuthorization() {
    this.diagnostic.requestLocationAuthorization().then(
      status => this.handleLocationAuthorizationStatus(status), 
      error => this.onError(error)
    );
}

requestLocationAccuracy() {
  this.diagnostic.getLocationAuthorizationStatus().then(
    status => this.handleLocationAuthorizationStatus(status),
    error => this.onError(error));
}

_makeRequest(){
  this.location.canRequest().then(
    canRequest => {
        if (canRequest) {
            this.location.request(this.location.REQUEST_PRIORITY_HIGH_ACCURACY).then(
              success => {
                    console.log("Location accuracy request successful");
                }, 
              error => {
                    this.onError("Error requesting location accuracy: " + JSON.stringify(error));
                    if (error) {
                        // Android only
                        this.onError("error code=" + error.code + "; error message=" + error.message);
                        if (this.plt.is("android") && error.code !== this.location.ERROR_USER_DISAGREED) {
                            if (window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")) {
                                this.diagnostic.switchToLocationSettings();
                            }
                        }
                    }
                }
            );
        } else {
            // On iOS, this will occur if Location Services is currently on OR a request is currently in progress.
            // On Android, this will occur if the app doesn't have authorization to use location.
            this.onError("Cannot request location accuracy");
        }
    });
}


}
