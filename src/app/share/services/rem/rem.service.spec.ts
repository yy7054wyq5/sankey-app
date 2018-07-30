import { TestBed, inject } from '@angular/core/testing';

import { RemService } from './rem.service';

describe('RemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemService]
    });
  });

  it('should be created', inject([RemService], (service: RemService) => {
    expect(service).toBeTruthy();
  }));
});
