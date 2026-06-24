import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { applyListQuery, toPaginatedResponse } from '../common/utils/list-query.util';
import { Order } from './order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  findAll(query: ListQueryDto): Promise<PaginatedResponse<Order>> {
    const queryBuilder = this.repository
      .createQueryBuilder('orderEntity')
      .leftJoinAndSelect('orderEntity.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('orderEntity.user', 'user');

    applyListQuery(queryBuilder, query, {
      defaultSortBy: 'createdAt',
      sortFields: {
        id: 'orderEntity.id',
        userId: 'orderEntity.userId',
        status: 'orderEntity.status',
        totalCents: 'orderEntity.totalCents',
        createdAt: 'orderEntity.createdAt',
        updatedAt: 'orderEntity.updatedAt',
      },
      filterFields: {
        id: { column: 'orderEntity.id', type: 'exact' },
        userId: { column: 'orderEntity.userId', type: 'exact' },
        status: { column: 'orderEntity.status', type: 'exact' },
        totalCents: { column: 'orderEntity.totalCents', type: 'number' },
      },
      searchFields: ['user.name', 'user.email', 'product.name', 'product.sku'],
    });

    return toPaginatedResponse(queryBuilder, query);
  }

  findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });
  }

  save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
