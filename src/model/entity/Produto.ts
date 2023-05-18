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
  @Column()
  nome: string;
  @ManyToOne(() => GrupoProduto, (grupo) => grupo.id, { eager: true })
  @JoinColumn({name: "id_grupo", referencedColumnName: "id"})
  id_grupo: GrupoProduto;
  @Column()
  unidade: string;
  @Column()
  preco_custo: number;
  @Column()
  preco_compra: number;
  @Column()
  preco_venda: number;
  @Column()
  estoque_atual: number;
  @Column()
  ativo: string;
  @Column()
  gera_comissao: Boolean;
  @Column()
  comissao: number;

}
