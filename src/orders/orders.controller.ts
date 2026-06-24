import { Controller, Get, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.ordersService.findAll(query);
  }
}
