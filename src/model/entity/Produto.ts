import { GrupoProduto } from "./GrupoProduto";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "produtos" })
export class Produto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({type: "character varying", length: 120})
  nome: string;
  @ManyToOne(() => GrupoProduto, (grupo) => grupo.id, { eager: true })
  @JoinColumn({name: "id_grupo", referencedColumnName: "id"})
  id_grupo: GrupoProduto;
  @Column({type: "character varying", length: 5, default: "UN"})
  unidade: string;
  @Column({type: "numeric", precision: 14, scale: 2})
  preco_custo: number;
  @Column({type: "numeric", precision: 14, scale: 2})
  preco_compra: number;
  @Column({type: "numeric", precision: 14, scale: 2})
  preco_venda: number;
  @Column({type: "numeric", precision: 14, scale: 3})
  estoque_atual: number;
  @Column()
  ativo: string;
  @Column()
  gera_comissao: Boolean;
  @Column( {type: "numeric", precision: 14, scale: 2})
  comissao: number;

}
