export class DtoBaseResponse {
    message: string;
    success: boolean;
}

export const baseResponse: DtoBaseResponse = {
    message: '',
    success: true,
}

export const badResponse: DtoBaseResponse = {
    message: 'Ha ocurrido un error: ',
    success: false,
}