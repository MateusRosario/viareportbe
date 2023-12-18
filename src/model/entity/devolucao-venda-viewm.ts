import { JoinColumn, OneToMany, OneToOne, ViewColumn, ViewEntity } from "typeorm";
import { Devolucao } from "./devolucao";
import { DevolucaoItem } from "./devolucao-item";
import { Vendedor } from "./Vendedor";

@ViewEntity({
  materialized: true,
  /*expression: `SELECT v.id_vendedor,
    d.id,
    v.id AS id_venda,
    d.data,
    d.gerado,
    (d.vl_total + d.vl_desconto) AS vl_bruto,
    d.vl_desconto,
    d.vl_total,
    d.id_cliente,
    d.nome_cliente,
    d.id_fornecedor,
    d.nome_fornecedor
   FROM (venda v
     JOIN devolucao d ON (((v.id = d.id_pedido) AND ((d.tipo)::text = '1'::text))))
  ORDER BY d.id`,*/
})
export class DevolucaoVendaViewm {
  @ViewColumn()
  id: number;
  @ViewColumn()
  id_venda: string;
  // @ViewColumn()
  @JoinColumn({ name: 'id_vendedor', referencedColumnName: 'id' })
  @OneToOne(() => Vendedor, vend => vend.id)
  id_vendedor: Vendedor;
  @ViewColumn()
  data: Date;
  @ViewColumn()
  gerado: string;
  @ViewColumn()
  vl_bruto: number;
  @ViewColumn()
  vl_desconto: number;
  @ViewColumn()
  vl_total: number;
  @ViewColumn()
  id_cliente: number;
  @ViewColumn()
  nome_cliente: string;
  @ViewColumn()
  id_fornecedor: number;
  @ViewColumn()
  nome_fornecedor: string;
  @OneToMany(() => DevolucaoItem, di => di.id_devolucao)
  itens: DevolucaoItem[];

}
