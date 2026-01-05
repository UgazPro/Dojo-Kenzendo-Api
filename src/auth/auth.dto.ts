import { IsDate, IsNumber, IsString } from "class-validator";
import { DtoBaseResponse } from "../utilities/base.dto";
import { UsersDTO } from "@/users/users.dto";
import { Transform } from "class-transformer";

export class LoginDTO {
    @IsString()
    username: string;
    @IsString()
    password: string;
}

export class ResponseLogin extends DtoBaseResponse {
    token: string;
}

export class GoogleAuthDTO {
    @IsString()
    identification: string;
    @IsString()
    address: string;
    @IsString()
    phone: string;
    @IsDate()
    @Transform(({ value }) => new Date(value))
    birthday: Date;
    @IsNumber()
    rolId: number;
    @IsNumber()
    dojoId: number;
    @IsString()
    enrollmentDate: Date;
}