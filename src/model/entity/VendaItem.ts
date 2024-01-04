import { Vendedor } from './Vendedor';
import { Venda } from './Venda';
import { Produto } from './Produto';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NumericTransformer } from '../../services/FunctionsServices';

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
  @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, {eager: true})
  @JoinColumn({name: "id_vendedor", referencedColumnName: "id"})
  id_vendedor: Vendedor;
  @ManyToOne(() => Produto, prod => prod.id, {eager: true})
  @JoinColumn({name:"id_produto", referencedColumnName: "id"})
  id_produto: Produto;
  @Column()
  nome_produto: string;
  @Column()
  unidade: string;
  @Column({ type: "decimal", transformer: NumericTransformer })
  quantidade: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_unitario: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_desconto: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_total: number;
  @Column()
  id_grupo: number;
  @Column()
  cancelada: string;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_custo: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  qtd_caixa: number;

  headerCVS(): string {
    return 'ID;ID VENDA;ID PRODUTO;NOME PRODUTO;QUANTIDADE;VL UNITARIO;VL DESCONTO;VL TOTAL';
  }
  toCSV(){
    let retorno = "";

    retorno = this.id + ";" + this.id_venda.id + ";" + this.id_produto.id + ";" + this.nome_produto + ";" + this.quantidade + ";" + this.vl_unitario  + ";" + this.vl_desconto + ";" + this.vl_total;

    return retorno;
  }
}


