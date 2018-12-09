import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDetailPanelComponent } from './full-detail-panel.component';

describe('FullDetailPanelComponent', () => {
  let component: FullDetailPanelComponent;
  let fixture: ComponentFixture<FullDetailPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullDetailPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
