import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import kafkaConfig from '../config/kafka.config';
import { DomainEventRepository, RecordedKafkaEvent } from './domain-event.repository';
import { DomainEventEnvelope } from './domain-event.types';

const EVENT_TOPICS = ['orders.created', 'stock.depleted'] as const;

@Injectable()
export class KafkaEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaEventConsumerService.name);
  private consumer?: Consumer;
  private consumerReady?: Promise<Consumer>;

  constructor(
    @Inject(kafkaConfig.KEY) private readonly kafkaSettings: ConfigType<typeof kafkaConfig>,
    private readonly domainEventRepository: DomainEventRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.getConsumer();

    await this.consumer?.subscribe({
      topics: [...EVENT_TOPICS],
      fromBeginning: this.kafkaSettings.consumeFromBeginning,
    });

    await this.consumer?.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.handleMessage(topic, partition, message.offset, message.value?.toString('utf8') ?? '');
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.consumer) {
      return;
    }

    await this.consumer.disconnect();
    this.consumer = undefined;
    this.consumerReady = undefined;
  }

  private async handleMessage(topic: string, partition: number, offset: string, rawValue: string): Promise<void> {
    let envelope: DomainEventEnvelope<Record<string, unknown>>;

    try {
      envelope = JSON.parse(rawValue) as DomainEventEnvelope<Record<string, unknown>>;
    } catch (error) {
      this.logger.error(`Discarded invalid Kafka payload from ${topic}[${partition}]`, error as Error);
      return;
    }

    const record: RecordedKafkaEvent = {
      topic,
      eventName: envelope.eventName,
      aggregateId: envelope.aggregateId ?? this.extractAggregateId(envelope.data),
      partition,
      offset,
      payload: envelope as unknown as Record<string, unknown>,
      occurredAt: new Date(envelope.occurredAt),
    };

    await this.domainEventRepository.record(record);
    this.logger.debug(`Consumed ${record.eventName} from ${topic}#${partition}:${record.offset}`);
  }

  private extractAggregateId(data: Record<string, unknown>): string | null {
    const candidate = data.id ?? data.productId ?? null;

    return typeof candidate === 'string' ? candidate : null;
  }

  private async getConsumer(): Promise<Consumer> {
    if (this.consumer) {
      return this.consumer;
    }

    if (!this.consumerReady) {
      const kafka = new Kafka({
        clientId: `${this.kafkaSettings.clientId}-consumer`,
        brokers: this.kafkaSettings.brokers,
      });

      this.consumer = kafka.consumer({ groupId: this.kafkaSettings.consumerGroupId });
      this.consumerReady = this.consumer.connect().then(() => this.consumer as Consumer);
    }

    return this.consumerReady;
  }
}
