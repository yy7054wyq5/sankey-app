import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {
  offsetX = '-23rem';
  constructor(
    public storage: StorageService
  ) {}

  ngOnInit() {}

  // showMenu() {
  //   if (this.offsetX === '-23rem') {
  //     this.offsetX = '0';
  //   } else {
  //     this.offsetX = '-23rem';
  //   }
  // }
}
