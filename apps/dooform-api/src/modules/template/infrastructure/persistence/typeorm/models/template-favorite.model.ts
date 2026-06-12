import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { TemplateModel } from './template.model'

@Entity('template_favorites')
@Unique(['userId', 'templateId'])
export class TemplateFavoriteModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @ManyToOne(() => TemplateModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template?: TemplateModel
}
