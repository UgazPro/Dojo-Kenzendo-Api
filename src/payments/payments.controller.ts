import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentDto, PaymentFilterDto, PaymentMethodDto } from './payments.dto';

@Controller('payments')
export class PaymentsController {

	constructor(private readonly paymentsService: PaymentsService) { }

	// Métodos de pago
	@Get('/methods')
	getPaymentMethods(@Query('dojoId') dojoId: string) {
		return this.paymentsService.getPaymentMethods(dojoId);
	}

	@Post('/methods')
	createPaymentMethod(@Body() data: PaymentMethodDto) {
		return this.paymentsService.createPaymentMethod(data);
	}

	@Put('/methods/:id')
	updatePaymentMethod(
		@Param('id', ParseIntPipe) id: number,
		@Body() data: PaymentMethodDto,
	) {
		return this.paymentsService.updatePaymentMethod(id, data);
	}

	@Delete('/methods/:id')
	deletePaymentMethod(@Param('id', ParseIntPipe) id: number) {
		return this.paymentsService.deletePaymentMethod(id);
	}

	// Pagos
	@Post('/search')
	getPayments(@Body() filters: PaymentFilterDto) {
		return this.paymentsService.getPayments(filters);
	}

	@Post()
	createPayment(@Body() data: PaymentDto) {
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
