import { Controller, Get, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.stockService.findAll(query);
  }
}
