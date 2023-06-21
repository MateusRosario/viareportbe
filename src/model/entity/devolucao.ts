import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Venda } from "./Venda";
import { Vendedor } from "./Vendedor";

@Entity({ name: "devolucao" })
export class Devolucao extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "character varying" })
  gerado: string;
  @Column({ type: "character varying" })
  tipo: string;
  @Column({ type: "date" })
  data: Date;
  @Column({ type: "character varying" })
  hora: string;
  @Column({ type: "integer" })
  id_cliente: number;
  @Column({ type: "character varying" })
  nome_cliente: string;
  @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, {eager: true})
  @JoinColumn({name: "id_vendedor", referencedColumnName: "id"})
  id_vendedor: Vendedor;
  @Column({ type: "numeric" })
  vl_desconto: number;
  @Column({ type: "numeric" })
  vl_produto: number;
  @Column({ type: "numeric" })
  vl_total: number;
  @ManyToOne(() => Venda, (venda) => venda.id, {eager: false})
  @JoinColumn({name: "id_pedido", referencedColumnName: "id"})
  @Column({ type: "integer" })
  id_pedido: Venda;
}
