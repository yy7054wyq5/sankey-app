import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
  constructor() {}

  put(key: string, data: any) {
    try {
      if (typeof data === 'string') {
        localStorage.setItem(key, data);
      } else {
        const dataStr = JSON.stringify(data);
        localStorage.setItem(key, dataStr);
      }
    } catch (error) {
      console.log(error);
    }
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  get(key: string): any {
    const _ = localStorage.getItem(key);
    try {
      return JSON.parse(_);
    } catch (error) {
      return _;
    }
  }

  clear() {
    localStorage.clear();
  }
}
