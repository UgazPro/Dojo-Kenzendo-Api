import { PartialType } from '@nestjs/mapped-types';
import { CreateMartialRankDto } from './create-martial-rank.dto';

export class UpdateMartialRankDto extends PartialType(CreateMartialRankDto) {}
