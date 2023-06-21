import { VendaItem } from "./../model/entity/VendaItem";
import { Venda } from "./../model/entity/Venda";
import { getConnection } from "../data-source";
import { Between, ViewColumn, ViewEntity } from "typeorm";
import { VendaCanceladaViewm } from "../model/entity/venda-cancelada-viewm";
export class EstatisticaVendaSQLBuilder {
  getGroupByVendedorSQL(aDataInicio: Date, aDataFim: Date): string {
    let retorno;

    let queryBuilder = getConnection("32.310.156/0001-65").createQueryBuilder();

    queryBuilder
      .select(
        `COALESCE 
    ( vend.ID, 0 ) AS ID, 
    COALESCE ( vend.nome, 'SEM VENDEDOR' ) AS nome, 
    SUM ( vi.vl_total + vi.vl_desconto ) :: NUMERIC ( 14, 2 ) AS bruto, 
    SUM ( vi.vl_desconto ) :: NUMERIC ( 14, 2 ) AS desconto, 
    SUM ( CASE WHEN vi.cancelada = 'SIM' THEN vi.vl_total ELSE 0.00 END ) :: NUMERIC ( 14, 2 ) AS item_cancelado`
      )
      .from(Venda, "v")
      .leftJoin("v.id_vendedor", "vend")
      .innerJoin(VendaItem, "vi", "v.id = vi.id_venda and not v.nf_uniao")
      .where(`v.data_saida between '${aDataInicio.toLocaleDateString()}' and '${aDataFim.toLocaleDateString()}' `)
      .andWhere("v.gerado = 'SIM'")
      .groupBy("vend.id, vend.nome")
      .orderBy({ "SUM ( CASE WHEN v.cancelada = 'NAO' AND vi.cancelada = 'NAO' THEN vi.vl_total ELSE 0.00 END )": "DESC" });

    retorno = queryBuilder.getQuery();

    return retorno;
  }

 getVendaCanceladaSQL( cnpj ,aDataInicio: Date, aDataFim: Date, aIdVendedor?: number, aListagemById: Boolean = false): Promise<[VendaCanceladaViewm[], number]> {
    let queryBuilder = getConnection(cnpj).createQueryBuilder<VendaCanceladaViewm>(VendaCanceladaViewm, "v");
    aListagemById
      ? queryBuilder.select("id")
      : queryBuilder.select(`SUM ( vl_produto )::numeric(14,2) AS produto_valor_bruto,
    SUM ( vl_servico )::numeric(14,2) AS servico_valor_bruto,
    SUM ( vl_desconto )::numeric(14,2) AS desconto,
    SUM ( vl_total )::numeric(14,2) AS liquido`);
    queryBuilder.where("data_cancelamento = :data", {data: Between(aDataInicio, aDataFim)})
    
    if ((aIdVendedor || 0) > 0) {
      queryBuilder.andWhere("id_vendedor = :id_vendedor", {id_vendedor: aIdVendedor})  
    }

    return queryBuilder.getManyAndCount();
  }
}

export class GroupByVendedorValues {
  id: number;
  nome: string;
  bruto: number;
  desconto: number;
  item_cancelado: number;
}