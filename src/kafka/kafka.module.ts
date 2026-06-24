import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import kafkaConfig from '../config/kafka.config';
import { DomainEventRecord } from './domain-event.entity';
import { DomainEventRepository } from './domain-event.repository';
import { KafkaEventConsumerService } from './kafka-event-consumer.service';
import { KafkaEventPublisherService } from './kafka-event-publisher.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(kafkaConfig), TypeOrmModule.forFeature([DomainEventRecord])],
  providers: [DomainEventRepository, KafkaEventPublisherService, KafkaEventConsumerService],
  exports: [KafkaEventPublisherService, KafkaEventConsumerService],
})
export class KafkaModule {}

