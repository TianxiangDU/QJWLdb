import { Entity, Column, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../../common/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码哈希' })
  @Exclude()
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '昵称' })
  nickname?: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '邮箱' })
  email?: string;

  @ApiProperty({ description: '手机号' })
  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone?: string;

  @ApiProperty({ description: '头像URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '头像URL' })
  avatar?: string;

  @ApiProperty({ description: '角色编码（兼容旧版）', enum: ['admin', 'user'] })
  @Column({ type: 'varchar', length: 20, default: 'user', comment: '角色编码（兼容旧版）' })
  role: string;

  @ApiProperty({ description: '角色ID' })
  @Column({ name: 'role_id', type: 'bigint', unsigned: true, nullable: true, comment: '角色ID' })
  roleId?: number;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  roleEntity?: Role;

  @ApiProperty({ description: '最后登录时间' })
  @Column({ name: 'last_login_at', type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP' })
  @Column({ name: 'last_login_ip', type: 'varchar', length: 50, nullable: true, comment: '最后登录IP' })
  lastLoginIp?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}


