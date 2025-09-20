import { Injectable } from '@nestjs/common';
import { CreateMartialRankDto } from './dto/create-martial-rank.dto';
import { UpdateMartialRankDto } from './dto/update-martial-rank.dto';

@Injectable()
export class MartialRanksService {
  create(createMartialRankDto: CreateMartialRankDto) {
    return 'This action adds a new martialRank';
  }

  findAll() {
    return `This action returns all martialRanks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} martialRank`;
  }

  update(id: number, updateMartialRankDto: UpdateMartialRankDto) {
    return `This action updates a #${id} martialRank`;
  }

  remove(id: number) {
    return `This action removes a #${id} martialRank`;
  }
}
