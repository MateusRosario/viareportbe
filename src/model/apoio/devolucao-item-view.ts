import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Produto } from "../entity/Produto";

@Entity({ name: "devolucao_item" })
export class DevolucaoItemView extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    id_devolucao: number;
    @ManyToOne(() => Produto, (produto) => produto.id, { eager: true })
    @JoinColumn({ name: "id_produto", referencedColumnName: "id" })
    id_produto: Produto;
    @Column({ type: "character varying" })
    nome_produto: string;
    @Column({ type: "character varying" })
    unidade: string;
    @Column({ type: "numeric" })
    quantidade: number;
    @Column({ type: "numeric" })
    vl_unitario: number;
    @Column({ type: "numeric" })
    vl_total: number;
    @Column({ type: "numeric" })
    desconto: number;
}
