import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreMainComponent } from './core-main.component';

describe('CoreMainComponent', () => {
  let component: CoreMainComponent;
  let fixture: ComponentFixture<CoreMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoreMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoreMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
