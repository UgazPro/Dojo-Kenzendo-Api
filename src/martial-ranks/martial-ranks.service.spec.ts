import { Test, TestingModule } from '@nestjs/testing';
import { MartialRanksService } from './martial-ranks.service';

describe('MartialRanksService', () => {
  let service: MartialRanksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MartialRanksService],
    }).compile();

    service = module.get<MartialRanksService>(MartialRanksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
