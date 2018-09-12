import { TestBed, inject } from '@angular/core/testing';

import { SearchRecordsService } from './search-records.service';

describe('SearchRecordsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchRecordsService]
    });
  });

  it('should be created', inject([SearchRecordsService], (service: SearchRecordsService) => {
    expect(service).toBeTruthy();
  }));
});
