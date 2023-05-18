import { Vendedor } from './Vendedor';
import { Venda } from './Venda';
import { Produto } from './Produto';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "venda"})
export class VendaResumo extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, {eager: true})
  @JoinColumn({name: "id_vendedor", referencedColumnName: "id"})
  id_vendedor: Vendedor;

}

@Entity({name: "venda_item"})
export class VendaItem extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Venda, venda => venda.id, {eager: true})
  @JoinColumn({name:"id_venda", referencedColumnName: "id"})
  id_venda: Venda;
  // @Column()
  // id_venda: number;
  @ManyToOne(() => Produto, prod => prod.id, {eager: true})
  @JoinColumn({name:"id_produto", referencedColumnName: "id"})
  id_produto: Produto;
  @Column()
  nome_produto: string;
  @Column()
  unidade: string;
  @Column({type: "numeric"})
  quantidade: number;
  @Column({type: "numeric"})
  vl_unitario: number;
  @Column({type: "numeric"})
  vl_desconto: number;
  @Column({type: "numeric"})
  vl_total: number;
  @Column()
  id_grupo: number;
  @Column()
  cancelada: string;
  @Column({type: "numeric"})
  vl_custo: number;
  @Column({type: "numeric"})
  qtd_caixa: number;
}


