import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  findAll(query: ListQueryDto) {
    return this.ordersRepository.findAll(query);
  }
}
