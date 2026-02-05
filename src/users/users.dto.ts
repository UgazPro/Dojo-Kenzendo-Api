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
    sex: string;
    @IsString()
    username: string;
    @IsString()
    address: string;
    @IsString()
    phone: string;
    @Type(() => Number)
    @IsNumber()
    dojoId: number;
    @Type(() => Number)
    @IsNumber()
    rolId: number;
    @Transform(({ value }) => new Date(value))
    @IsDate()
    birthday: Date;
    @Transform(({ value }) => new Date(value))
    @IsDate()
    enrollmentDate: Date;

    @Transform(({ value }) => {
        return JSON.parse(value);
    })
    @IsArray({message:'Debe ser un arreglo'})
    // @ValidateNested({ each: true })
    @Type(() => MartialArtRank)
    martialArtRank: MartialArtRank[];
}

export class MartialArtRank {
    @Type(() => Number)
    @IsNumber()
    martialArtId: number;
    @Type(() => Number)
    @IsNumber()
    rankId: number;
}

export class UserPassword {
    @IsNumber() 
    id: number;
    @IsString()
    password: string;
}




export interface UserTokenDecode {
    id:             number;
    identification: string;
    name:           string;
    lastName:       string;
    email:          string;
    username:       string;
    address:        string;
    phone:          string;
    sex:            string;
    dojoId:         number;
    rolId:          number;
    birthday:       Date;
    profileImg:     string;
    active:         boolean;
    deleted:        boolean;
    createdAt:      Date;
    enrollmentDate: Date;
    rol:            Rol;
    dojo:           Dojo;
    iat:            number;
    exp:            number;
}

export interface Dojo {
    id:          number;
    dojo:        string;
    phone:       string;
    description: string;
    address:     string;
    logo:        string;
    latitude:    number;
    longitude:   number;
    code:        string;
    createdAt:   Date;
}

export interface Rol {
    id:  number;
    rol: string;
}
