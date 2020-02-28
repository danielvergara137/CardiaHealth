import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  API_URL = 'http://footshotcloud.cl:3000/api/device/cardialysExam/';

  constructor() { }
}
