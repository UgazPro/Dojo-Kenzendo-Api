import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MartialRanksService } from './martial-ranks.service';
import { CreateMartialRankDto } from './dto/create-martial-rank.dto';
import { UpdateMartialRankDto } from './dto/update-martial-rank.dto';

@Controller('martial-ranks')
export class MartialRanksController {
  constructor(private readonly martialRanksService: MartialRanksService) {}

  @Post()
  create(@Body() createMartialRankDto: CreateMartialRankDto) {
    return this.martialRanksService.create(createMartialRankDto);
  }

  @Get()
  findAll() {
    return this.martialRanksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.martialRanksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMartialRankDto: UpdateMartialRankDto) {
    return this.martialRanksService.update(+id, updateMartialRankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.martialRanksService.remove(+id);
  }
}
