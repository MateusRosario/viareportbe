import { Vendedor } from './Vendedor';
import { Devolucao } from './devolucao';
import { Produto } from './Produto';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "devolucao_item" })
export class DevolucaoItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Devolucao, (devolucao) => devolucao.id, {eager: true})
  @JoinColumn({name: "id_devolucao", referencedColumnName: "id"})
  id_devolucao: Devolucao;
  @ManyToOne(() => Produto, (produto) => produto.id, {eager: true})
  @JoinColumn({name: "id_produto", referencedColumnName: "id"})
  // @Column({type: "int4"})
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
