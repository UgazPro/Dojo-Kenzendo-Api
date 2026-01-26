import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaymentDto, PaymentFilterDto, PaymentMethodDto } from './payments.dto';
import { badResponse, baseResponse } from '@/utilities/base.dto';
import { UserTokenDecode } from '@/users/users.dto';

@Injectable()
export class PaymentsService {

    constructor(private readonly prismaService: PrismaService) {

    }

    async getPaymentMethods(user: UserTokenDecode, dojoId: string) {
        const where: any = {};

        if (user.rol && user.rol.rol !== 'Administrador') {
            where.dojoId = user.dojoId;
        } else {
            if (dojoId) where.dojoId = Number(dojoId);
        }

        try {
            return await this.prismaService.paymentMethods.findMany({
                where,
                orderBy: { id: 'asc' },
            });
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createPaymentMethod(user: UserTokenDecode, data: PaymentMethodDto) {
        try {
            
            const created = await this.prismaService.paymentMethods.create({
                data: {
                    bank: data.bank,
                    payment_method: data.payment_method,
                    dojoId: user.dojoId,
                    email: data.email ? data.email : '',
                    phone: data.phone,
                    identification: data.identification,
                },
            });
            baseResponse.data = created;
            baseResponse.message = 'Método de pago creado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updatePaymentMethod(user: UserTokenDecode, id: number, data: PaymentMethodDto) {
        try {
            const updated = await this.prismaService.paymentMethods.update({
                where: { id },
                data: {
                    bank: data.bank,
                    payment_method: data.payment_method,
                    dojoId: user.dojoId,
                    email: data.email ? data.email : '',
                    phone: data.phone,
                    identification: data.identification,
                },
            });
            baseResponse.data = updated;
            baseResponse.message = 'Método de pago actualizado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async deletePaymentMethod(id: number) {
        try {
            await this.prismaService.paymentMethods.delete({ where: { id } });
            baseResponse.message = 'Método de pago eliminado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getPayments(user: UserTokenDecode, filters?: PaymentFilterDto) {
        const where: any = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.paymentMethodId) where.paymentMethodId = filters.paymentMethodId;  
        if (filters?.startDate || filters?.endDate) {
            where.payment_date = {};
            if (filters?.startDate) where.payment_date.gte = filters?.startDate;
            if (filters?.endDate) {
                const end = new Date(filters?.endDate);
                end.setHours(23, 59, 59, 999);
                where.payment_date.lte = end;
            }
        }

        if (!user.rol || user.rol.rol !== 'Administrador') {
            where.paymentMethod = { dojoId: user.dojoId };
        } else {``
            if (filters?.dojoId) {
                where.paymentMethod = { dojoId: filters.dojoId };
            }
        }

        try {
            const payments = await this.prismaService.payments.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, lastName: true, identification: true }
                    },
                    paymentMethod: {
                        select: { id: true, payment_method: true, bank: true, dojoId: true }
                    }
                },
                orderBy: { payment_date: 'desc' },
            });
            return payments;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createPayment(data: PaymentDto) {
        try {
            const created = await this.prismaService.payments.create({
                data,
            });
            baseResponse.data = created;
            baseResponse.message = 'Pago registrado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updatePayment(id: number, data: PaymentDto) {
        try {
            const updated = await this.prismaService.payments.update({
                where: { id },
                data,
            });
            baseResponse.data = updated;
            baseResponse.message = 'Pago actualizado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }
}
