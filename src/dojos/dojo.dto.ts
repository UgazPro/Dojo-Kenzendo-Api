import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class SocialMediaDto {
    @IsString()
    socialMedia!: string;

    @IsString()
    link!: string;

    @IsString()
    @IsOptional()
    directUrl?: string;
}

export class DojoDto {
    @IsString()
    dojo!: string;
    @IsString()
    address!: string;
    @IsString()
    addressShort!: string;
    @IsString()
    code!: string;
    @IsString()
    phone!: string;
    @IsString()
    email!: string;
    @IsString()
    description!: string;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    founded!: Date;

    @IsString()
    slogan!: string;

    @IsString()
    translate!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude!: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude!: number;

    @Type(() => Number)
    @IsNumber({}, { each: true })
    martialArts!: number[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialMediaDto)
    socialMedia?: SocialMediaDto[];
}

export class ScheduleDojoDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDTO)
    schedule!: ScheduleDTO[];
}

export class ScheduleDTO {
    @IsNumber()
    dojoId!: number;
    @IsString()
    day!: string;
    @IsString()
    name!: string;
    @IsString()
    startTime!: string;
    @IsString()
    endTime!: string;
    @IsNumber()
    martialArtId!: number;
}

//Attendance

export class AttendanceFilter {
    @IsNumber()
    dojoId!: number;
    @IsDate()
    @Transform(({ value }) => new Date(value))
    startOfWeek!: Date;
    @IsDate()
    @Transform(({ value }) => new Date(value))
    endOfWeek!: Date;
}
export class MarkAttendanceDto {
    @IsNumber()
    dojoId!: number;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsBoolean()
    @IsOptional()
    came?: boolean;

    @IsNumber()
    scheduleId!: number; // El ID del horario detectado o seleccionado

    @IsArray()
    @IsNumber({}, { each: true })
    userIds!: number[]; // Lista de IDs de alumnos presentes
}

export class DojoImagesDto {
    @IsNumber()
    dojoId!: number;

    @IsString()
    type!: string;

    @IsArray()
    @IsString({ each: true })
    urls!: string[];
}