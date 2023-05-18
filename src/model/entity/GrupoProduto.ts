import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Table } from 'typeorm';

@Entity({name: 'grupo_produto'})
export class GrupoProduto extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nome: string;
    @Column({type:'numeric'})
    comissao: number;
    @Column()
    gera_comissao: Boolean;
    @Column({name: "comissao_vendedor", type:'numeric'})
    comissao_vendedor: number;
}
