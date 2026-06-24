import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDomainEvents1760000004000 implements MigrationInterface {
  name = 'CreateDomainEvents1760000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "domain_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "topic" character varying(120) NOT NULL,
        "event_name" character varying(120) NOT NULL,
        "aggregate_id" character varying(120),
        "partition" integer NOT NULL,
        "offset" character varying(40) NOT NULL,
        "payload" jsonb NOT NULL,
        "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "consumed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_domain_events_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_domain_events_topic_partition_offset" ON "domain_events" ("topic", "partition", "offset")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_domain_events_topic_partition_offset"`);
    await queryRunner.query(`DROP TABLE "domain_events"`);
  }
}
