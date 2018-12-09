import { Injectable } from '@angular/core';

const loadingStyle = 'position: fixed;left: 0;top: 0;width: 100vw;height: 100vh; z-index:9';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  status = false;
  constructor() {}
  loadingShadow: Element;

  open() {
    this.status = true;
    if (!this.loadingShadow) {
      this.loadingShadow = document.createElement('div');
      this.loadingShadow.setAttribute('style', loadingStyle);
      document.querySelector('body').appendChild(this.loadingShadow);
    } else {
      this.loadingShadow.setAttribute('style', loadingStyle);
    }
  }

  close() {
    this.loadingShadow.setAttribute('style', 'display: none;');
    this.status = false;
  }
}
