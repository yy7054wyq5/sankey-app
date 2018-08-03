import { TestBed, inject } from '@angular/core/testing';

import { InterceptorsService } from './interceptors.service';

describe('InterceptorsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InterceptorsService]
    });
  });

  it('should be created', inject([InterceptorsService], (service: InterceptorsService) => {
    expect(service).toBeTruthy();
  }));
});
