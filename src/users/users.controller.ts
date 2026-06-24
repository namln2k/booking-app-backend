import { Controller, Get, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.usersService.findAll(query);
  }
}
