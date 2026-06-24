import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { StockRepository } from './stock.repository';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  findAll(query: ListQueryDto) {
    return this.stockRepository.findAll(query);
  }
}
