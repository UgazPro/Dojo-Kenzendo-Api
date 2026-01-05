import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsString, Max, Min, ValidateNested } from "class-validator";

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

//Attendance

export class AttendanceFilter {
    @IsNumber()
    dojoId: number;
    @IsDate()
    @Transform(({ value }) => new Date(value))
    startOfWeek: Date;
    @IsDate()
    @Transform(({ value }) => new Date(value))
    endOfWeek: Date;
}
export class MarkAttendanceDto {
    @IsNumber()
    dojoId: number;

    @IsNumber()
    scheduleId: number; // El ID del horario detectado o seleccionado

    @IsArray()
    @IsNumber({}, { each: true })
    userIds: number[]; // Lista de IDs de alumnos presentes
}