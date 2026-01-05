import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ActivityFilterDto {
	@IsOptional()
	@IsNumber()
	dojoId?: number;

	@IsOptional()
	@IsDate()
	@Transform(({ value }) => value ? new Date(value) : undefined)
	date?: Date;

	@IsOptional()
	@IsString()
	place?: string;

	@IsOptional()
	@IsString()
	name?: string;
}

export class ActivityDto {
	@IsString()
	name: string;

	@IsDate()
	@Transform(({ value }) => new Date(value))
	date: Date;

	@IsString()
	place: string;

	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude: number;

	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude: number;

	@IsOptional()
	@IsNumber()
	dojosId?: number;

	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	dojoIds?: number[];
}

export class MarkActivityAttendanceDto {
	@IsNumber()
	activityId: number;

	@IsArray()
	@IsNumber({}, { each: true })
	userIds: number[];
}

export class ExamDto {
	@IsNumber()
	martialArtId: number;

	@IsNumber()
	userId: number;

	@IsNumber()
	ranksId: number;

	@IsNumber()
	activityId: number;
}

export class AppliedStudentDto {
	@IsNumber()
	martialArtId: number;

	@IsNumber()
	userId: number;

	@IsNumber()
	ranksId: number;

	@IsNumber()
	activityId: number;
}
