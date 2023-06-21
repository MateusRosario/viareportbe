import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    materialized: true,
    expression: `SELECT v.id_vendedor,
    d.id,
    d.data,
    d.gerado,
    (d.vl_total + d.vl_desconto) AS vl_bruto,
    d.vl_desconto,
    d.vl_total
   FROM (venda v
     JOIN devolucao d ON (((v.id = d.id_pedido) AND ((d.tipo)::text = '1'::text))))
  ORDER BY d.id`,
  })
export class DevolucaoVendaViewm {
    @ViewColumn()
    id: number;
    @ViewColumn()
    id_vendedor: number;
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
}
