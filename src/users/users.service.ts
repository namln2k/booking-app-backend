import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(query: ListQueryDto) {
    return this.usersRepository.findAll(query);
  }
}
