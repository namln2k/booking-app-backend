import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEventRecord } from './domain-event.entity';

export interface RecordedKafkaEvent {
  topic: string;
  eventName: string;
  aggregateId: string | null;
  partition: number;
  offset: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

@Injectable()
export class DomainEventRepository {
  constructor(
    @InjectRepository(DomainEventRecord)
    private readonly repository: Repository<DomainEventRecord>,
  ) {}

  async record(event: RecordedKafkaEvent): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .values({
        ...event,
        payload: event.payload as never,
      })
      .orIgnore()
      .execute();
  }
}
