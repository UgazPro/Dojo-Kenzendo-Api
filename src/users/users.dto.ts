import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from "class-validator";

export class UsersDTO {
    @IsString()
    identification: string;
    @IsString()
    name: string;
    @IsString()
    lastName: string;
    @IsString()
    email: string;
    @IsString()
    username: string;
    @IsString()
    address: string;
    @IsString()
    phone: string;
    @IsNumber()
    dojoId: number;
    @IsNumber()
    rolId: number;
    @Transform(({ value }) => new Date(value))
    @IsDate()
    birthday: Date;
    @IsString()
    profileImg: string;

    @Transform(({ value }) => new Date(value))
    @IsDate()
    enrollmentDate: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MartialArtRank)
    martialArtRank: MartialArtRank[]
}

export class MartialArtRank {
    @IsNumber()
    martialArtId: number
    @IsNumber()
    rankId: number
}



