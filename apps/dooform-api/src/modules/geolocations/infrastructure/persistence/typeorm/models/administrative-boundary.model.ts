import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity('administrative_boundaries')
export class AdministrativeBoundaryModel {
  @PrimaryColumn({ type: 'int', name: 'objectid' })
  objectid!: number

  @Column({ type: 'varchar', name: 'admin_id1', default: '' })
  adminId1!: string

  @Column({ type: 'varchar', name: 'admin_id2', default: '' })
  adminId2!: string

  @Column({ type: 'varchar', name: 'admin_id3', default: '' })
  adminId3!: string

  @Column({ type: 'varchar', name: 'name1', default: '' })
  name1!: string

  @Column({ type: 'varchar', name: 'name_eng1', default: '' })
  nameEng1!: string

  @Column({ type: 'varchar', name: 'name2', default: '' })
  name2!: string

  @Column({ type: 'varchar', name: 'name_eng2', default: '' })
  nameEng2!: string

  @Column({ type: 'varchar', name: 'name3', default: '' })
  name3!: string

  @Column({ type: 'varchar', name: 'name_eng3', default: '' })
  nameEng3!: string

  @Column({ type: 'int', default: 0 })
  type!: number

  @Column({ type: 'varchar', default: '' })
  version!: string

  @Column({ type: 'int', name: 'pop_year', default: 0 })
  popYear!: number

  @Column({ type: 'float', default: 0 })
  population!: number

  @Column({ type: 'float', default: 0 })
  male!: number

  @Column({ type: 'float', default: 0 })
  female!: number

  @Column({ type: 'float', default: 0 })
  house!: number

  @Column({ type: 'float', name: 'shape__area', default: 0 })
  shapeArea!: number

  @Column({ type: 'float', name: 'shape__length', default: 0 })
  shapeLength!: number
}
