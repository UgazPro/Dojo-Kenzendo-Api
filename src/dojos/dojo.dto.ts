import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, Max, Min, ValidateNested } from "class-validator";

export class DojoDto {
    @IsString()
    dojo: string;
    @IsString()
    address: string;
    @IsString()
    code: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;


    @IsNumber({}, { each: true })
    martialArts: number[];
}

export class ScheduleDojoDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDTO)
    schedule: ScheduleDTO[]
}

export class ScheduleDTO {
    @IsNumber()
    dojoId: number;
    @IsString()
    day: string;
    @IsString()
    name: string;
    @IsString()
    startTime: string;
    @IsString()
    endTime: string;
    @IsNumber()
    martialArtId: number;
}