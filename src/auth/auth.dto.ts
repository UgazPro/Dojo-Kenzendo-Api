import { IsString } from "class-validator";
import { DtoBaseResponse } from "../utilities/base.dto";

export class LoginDTO {
    @IsString()
    username: string;
    @IsString()
    password: string;
}

export class ResponseLogin extends DtoBaseResponse {
    token: string;
}