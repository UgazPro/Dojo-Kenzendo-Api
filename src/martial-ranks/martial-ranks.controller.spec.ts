import { Test, TestingModule } from '@nestjs/testing';
import { MartialRanksController } from './martial-ranks.controller';
import { MartialRanksService } from './martial-ranks.service';

describe('MartialRanksController', () => {
  let controller: MartialRanksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MartialRanksController],
      providers: [MartialRanksService],
    }).compile();

    controller = module.get<MartialRanksController>(MartialRanksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
