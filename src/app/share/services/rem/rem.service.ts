import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RemService {

  rem: number;

  constructor(
  ) { }

  setDpr(): void {
    const dpr: number = window.devicePixelRatio || 1;
    const htmlEl: HTMLElement = document.documentElement; // 根元素
    const metaEl: HTMLElement = document.querySelector('meta[name="viewport"]');
    // 假设在设计图宽度是1980px，100rem等于1980px，那么 1rem = 19.8px
    // 设计图上90px，转换为rem就是90/19.8 rem
    this.rem = htmlEl.clientWidth * dpr / 100;
    let fontSize = this.rem / dpr;
    if (htmlEl.clientWidth < 1000) {
      fontSize = 14;
    }
    // console.log(this.rem);
    htmlEl.setAttribute('style', `font-size: ${fontSize}px !important;`);
    metaEl.setAttribute('content', 'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
  }


  /**
   * rem转px
   *
   * @param {number} v
   * @returns {number}
   * @memberof RemService
   */
  rem2px(v: number): number {
    v = parseFloat(v.toString());
    return v * this.rem;
  }

  /**
   * px转rem
   *
   * @param {number} v
   * @returns {number}
   * @memberof RemService
   */
  px2rem(v: number): number {
    v = parseFloat(v.toString());
    return v / this.rem;
  }

}
