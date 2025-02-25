import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: false, type: 'text', unique: true })
  code: string;

  @Column({
    nullable: false,
    type: 'float',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  area: number;

  @OneToMany(() => Location, (location) => location.parent, {
    cascade: true,
  })
  children: Location[];

  @ManyToOne(() => Location, (location) => location.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Location;

  @Column({ name: 'parent_id', type: 'integer' })
  parentId?: number;
}
