import { VendaItem } from "./../model/entity/VendaItem";
import { Venda } from "./../model/entity/Venda";
import { AppDataSource } from "./../data-source";
import { Between } from "typeorm";
export class EstatisticaVendaSQLBuilder {
     
  GroupByVendedor(aDataInicio: Date, aDataFim: Date): string {
    let retorno;

    let queryBuilder = AppDataSource.createQueryBuilder();

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
}

export class GroupByVendedorReturnRow {
    id: number;
    nome: string;
    bruto: number;
    desconto: number;
    item_cancelado: number;
}
