import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class PaymentMethodDto {
    @IsString()
    @IsNotEmpty()
    payment_method: string;

    @IsString()
    @IsNotEmpty()
    bank: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    identification: string;
}

export class PaymentDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    paymentMethodId: number;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    payment_date: Date;
}

export class PaymentFilterDto {
    @IsNumber()
    dojoId: number;

    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsOptional()
    @IsNumber()
    paymentMethodId?: number;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    startDate?: Date;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    endDate?: Date;
}
