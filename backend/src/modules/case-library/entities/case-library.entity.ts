import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('case_library')
export class CaseLibrary extends BaseEntity {
  @ApiProperty({ description: '编码' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '编码' })
  code: string;

  @ApiProperty({ description: '名称' })
  @Column({ type: 'varchar', length: 200, comment: '名称' })
  name: string;

  @ApiProperty({ description: '描述' })
  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @ApiProperty({ description: '标签' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '标签（逗号分隔）' })
  tags: string;
}


