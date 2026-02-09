import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentDto, PaymentFilterDto, PaymentMethodDto } from './payments.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/guards/roles/roles.decorator';

@Controller('payments')
export class PaymentsController {

	constructor(private readonly paymentsService: PaymentsService) { }

	// Métodos de pago
	@Get('/methods')
	getPaymentMethods(
		@CurrentUser() user,
		@Query('dojoId') dojoId: string) {
		return this.paymentsService.getPaymentMethods(user, dojoId);
	}

	@Roles('Líder Instructor', 'Administrador')
	@Post('/methods')
	createPaymentMethod(
		@CurrentUser() user,
		@Body() data: PaymentMethodDto) {
		return this.paymentsService.createPaymentMethod(user, data);
	}

	@Roles('Líder Instructor', 'Administrador')
	@Put('/methods/:id')
	updatePaymentMethod(
		@CurrentUser() user,
		@Param('id', ParseIntPipe) id: number,
		@Body() data: PaymentMethodDto,
	) {
		return this.paymentsService.updatePaymentMethod(user, id, data);
	}

	@Roles('Líder Instructor', 'Administrador')
	@Delete('/methods/:id')
	deletePaymentMethod(
		@Param('id', ParseIntPipe) id: number) {
		return this.paymentsService.deletePaymentMethod(id);
	}

	// Pagos
	@Post('/search')
	getPayments(
		@CurrentUser() user,
		@Body() filters?: PaymentFilterDto) {
		return this.paymentsService.getPayments(user, filters);
	}

	@Post()
	createPayment(
		@Body() data: PaymentDto) {
		return this.paymentsService.createPayment(data);
	}

	@Put('/:id')
	updatePayment(
		@Param('id', ParseIntPipe) id: number,
		@Body() data: PaymentDto,
	) {
		return this.paymentsService.updatePayment(id, data);
	}
}
