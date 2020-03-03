import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AwsService {
  apiUrl = 'https://cardiahealth-server.herokuapp.com/';
  apiPlatform ='http://footshotcloud.cl:3000/api/device/cardialysExam';

  constructor( public http: HttpClient ) {}

  uploadtoS3(name, type, stringToWrite) {
    return this.http.post(`${this.apiUrl}aws/upload?file-name=${name}&file-type=${type}`, stringToWrite);
  }

  uploadtoplatform(interpretation, patientid, device){
    return this.http.post(this.apiPlatform, 
      {'status': 'final', 
       'interpretation': interpretation,
       'note': '',
       'patientId': patientid,
       'device': device}, {
        'responseType': 'text'
      });
  }

}
