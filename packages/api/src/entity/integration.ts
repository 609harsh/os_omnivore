import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

export enum IntegrationType {
  Readwise = 'READWISE',
}

@Entity({ name: 'integrations' })
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('enum', { enum: IntegrationType })
  type!: IntegrationType

  @Column('varchar', { length: 255 })
  token!: string

  @Column('boolean', { default: true })
  enabled!: boolean

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamp', { nullable: true })
  syncedAt?: Date | null

  @Column('text', { nullable: true })
  taskName?: string | null
}
