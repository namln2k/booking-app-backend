import { registerAs } from '@nestjs/config';

const DEFAULT_KAFKA_BROKERS = ['kafka:29092'];
const DEFAULT_KAFKA_CLIENT_ID = 'ecommerce-app-backend';
const DEFAULT_KAFKA_CONSUMER_GROUP_ID = 'ecommerce-app-backend-events';

function normalizeBrokers(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return DEFAULT_KAFKA_BROKERS;
  }

  return rawValue
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

export default registerAs('kafka', () => ({
  brokers: normalizeBrokers(process.env.KAFKA_BROKERS),
  clientId: process.env.KAFKA_CLIENT_ID || DEFAULT_KAFKA_CLIENT_ID,
  consumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || DEFAULT_KAFKA_CONSUMER_GROUP_ID,
  consumeFromBeginning: (process.env.KAFKA_CONSUME_FROM_BEGINNING || 'true').toLowerCase() === 'true',
}));
