export interface DomainEventEnvelope<T> {
  eventName: string;
  occurredAt: string;
  aggregateId?: string | null;
  data: T;
}

