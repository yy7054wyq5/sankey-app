import { TestBed, inject } from '@angular/core/testing';

import { CoreMainService } from './core-main.service';

describe('CoreMainService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreMainService]
    });
  });

  it('should be created', inject([CoreMainService], (service: CoreMainService) => {
    expect(service).toBeTruthy();
  }));
});
