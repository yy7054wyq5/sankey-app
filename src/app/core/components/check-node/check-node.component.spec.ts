import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckNodeComponent } from './check-node.component';

describe('CheckNodeComponent', () => {
  let component: CheckNodeComponent;
  let fixture: ComponentFixture<CheckNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
