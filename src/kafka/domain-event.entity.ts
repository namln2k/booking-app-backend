import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'domain_events' })
@Index(['topic', 'partition', 'offset'], { unique: true })
export class DomainEventRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  topic!: string;

  @Column({ name: 'event_name', type: 'varchar', length: 120 })
  eventName!: string;

  @Column({ name: 'aggregate_id', type: 'varchar', length: 120, nullable: true })
  aggregateId!: string | null;

  @Column({ type: 'integer' })
  partition!: number;

  @Column({ type: 'varchar', length: 40 })
  offset!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @CreateDateColumn({ name: 'consumed_at' })
  consumedAt!: Date;
}

