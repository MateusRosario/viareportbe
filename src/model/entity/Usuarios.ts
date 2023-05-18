import { Vendedor } from './Vendedor';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "usuarios"})
export class Usuarios extends BaseEntity {
   
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nome: string;
    @Column()
    tipo: string;

    @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, {eager: true})
    @JoinColumn({name: "id_vendedor", referencedColumnName: "id"})
    id_vendedor: Vendedor;

    @Column()
    ativo: Boolean;
}
