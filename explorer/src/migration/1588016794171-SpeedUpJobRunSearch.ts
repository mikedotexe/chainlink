import { MigrationInterface, QueryRunner } from 'typeorm'

export class SpeedUpJobRunSearch1588016794171 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // NB: We have to do this in a different QueryRunner b/c the QueryRunner
    // provided to us by the migration executor is already in a transaction.
    // You can't run concurrent index creation inside a transaction.
    const nonTransactionQueryRunner = queryRunner.connection.createQueryRunner()
    await nonTransactionQueryRunner.query(`
        CREATE INDEX CONCURRENTLY "job_run_searchable_addresses" ON "job_run" USING GIN
          ((ARRAY["job_run"."runId","job_run"."jobId","job_run"."requestId","job_run"."requester", "job_run"."txHash"]));
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        DROP INDEX "job_run_searchable_addresses";
      `)
  }
}
