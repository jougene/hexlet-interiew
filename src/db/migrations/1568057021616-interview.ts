import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class interview1568057021616 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'interview',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'state',
            type: 'varchar',
          },
          {
            name: 'interviewer',
            type: 'varchar',
          },
          {
            name: 'interviewee',
            type: 'varchar',
          },
          {
            name: 'video_link',
            type: 'varchar',
          },
          {
            name: 'date',
            type: 'datetime',
          },
          {
            name: 'created_at',
            type: 'datetime',
          },
          {
            name: 'updated_at',
            type: 'datetime',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('interview');
  }
}
