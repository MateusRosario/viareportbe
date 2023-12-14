import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  materialized: true,
  /*expression: `SELECT venda.id,
  venda.data_cancelamento,
  venda.id_vendedor,
  venda.vl_produto,
  venda.vl_servico,
  venda.vl_desconto,
  venda.vl_total
  FROM venda
  WHERE ((NOT venda.nf_uniao) AND ((venda.gerado)::text = 'SIM'::text) AND ((venda.cancelada)::text = 'SIM'::text))
  ORDER BY venda.data_cancelamento`,*/
})
export class VendaCanceladaViewm {
  @ViewColumn()
  id: number;
  @ViewColumn()
  data_cancelamento: Date;
  @ViewColumn()
  id_vendedor: number;
  @ViewColumn()
  vl_produto: number;
  @ViewColumn()
  vl_servico: number;
  @ViewColumn()
  vl_desconto: number;
  @ViewColumn()
  vl_total: number;
}
