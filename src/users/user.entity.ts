import { IsBoolean } from 'class-validator';
import { Report } from '../reports/reports.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log('Insert User with id ', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Update User with id ', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Remove User with id ', this.id);
  }
}
