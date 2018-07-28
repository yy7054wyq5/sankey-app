import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  index = 0;

  constructor() { }

  update() {
    this.index += 1;
  }
}
