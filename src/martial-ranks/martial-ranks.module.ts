import { Module } from '@nestjs/common';
import { MartialRanksService } from './martial-ranks.service';
import { MartialRanksController } from './martial-ranks.controller';

@Module({
  controllers: [MartialRanksController],
  providers: [MartialRanksService],
})
export class MartialRanksModule {}
