import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll(query: ListQueryDto) {
    return this.productsRepository.findAll(query);
  }
}
