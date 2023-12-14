import { PageService } from "../service/PageService";
import { Response, Request, Router, NextFunction } from "express";
import { Venda } from "../model/entity/Venda";
import { BuildRote, Controller, getByModel, TypedRequestBody } from "./common/ControllerBase";
import { getConnection } from "../data-source";
import { VendaCanceladaViewm } from "../model/entity/venda-cancelada-viewm";
import { FormaPagamento } from "../model/entity/FormaPagamento";
import { VendaDuplicata } from "../model/entity/venda-duplicata";
import { Between, In, MoreThan } from "typeorm";
import { Vendedor } from "../model/entity/Vendedor";
import { DevolucaoVendaViewm } from "../model/entity/devolucao-venda-viewm";
import { isValid } from "../service/FunctionsServices";

export class VendaController implements Controller<Venda> {
  getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; numberPage: number }>, res: Response<any, Record<string, any>>, next: any) {
    throw new Error("Method not implemented.");
  }

  getByModel(req: TypedRequestBody<Venda>, res: Response<any, Record<string, any>>, next: any) {
    getByModel(req, res, next, new PageService<Venda>(new Venda(), req.headers["cnpj"] as string));
  }

  getVendasorFormaDePagamento(req: Request, res: Response, next: NextFunction) {
    const conn = getConnection(req.headers['cnpj'] as string); //.getRepository(VendaDuplicata);

    const filtros = {
      dataInicio: new Date(req.query.dataInicio as string),
      dataFim: new Date(req.query.dataFim as string),
      idVendedor: req.query.idVendedor as string
    }
    const ids = filtros.idVendedor ? filtros.idVendedor.split(',') : [];
    const where = ids.length > 0 ? `
              v.data_saida BETWEEN :ini 
              AND :fim 
              AND v.gerado = 'SIM' 
              AND not "v".nf_uniao
              AND v.id_vendedor in (${ids.map(id => Number(id)).join(', ')})
            ` : `
                v.data_saida BETWEEN :ini 
                AND :fim 
                AND not "v".nf_uniao
                AND v.gerado = 'SIM'  
                ` ;

    const qry = conn.createQueryBuilder()
      .select(`v.id_vendedor,
               TRIM(ven.nome) as nome_vendedor,
               fp.ID,
               TRIM ( fp.nome ) AS nome,
               SUM ( CASE WHEN vcv.ID IS NOT NULL THEN vd.vl_total ELSE 0.00 END ) :: FLOAT AS cancelado,
               SUM ( CASE WHEN vcv.ID IS NULL THEN vd.vl_total ELSE 0.00 END ) :: FLOAT AS total 
               `)
      .from(VendaDuplicata, 'vd')
      .innerJoin(FormaPagamento, 'fp', 'vd.idForma.id = fp.id')
      .innerJoin(Venda, 'v', 'v.id = vd.idVenda.id')
      .innerJoin(Vendedor, 'ven', 'ven.id = v.id_vendedor')
      .leftJoin(VendaCanceladaViewm, 'vcv', 'vcv.id = v.id')
      .where(where, { ini: filtros.dataInicio, fim: filtros.dataFim })
      .groupBy('fp.ID, fp.nome, v.id_vendedor.id, ven.nome');

    qry.getRawMany().then(vds => {
      let aux = { data: Between(filtros.dataInicio, filtros.dataFim) }
      if (ids.length > 0) {
        aux['id_vendedor'] = In(ids)
      }
      conn.getRepository(DevolucaoVendaViewm).createQueryBuilder()
        .select('sum(vl_total):: FLOAT as liquido, id_vendedor').where(aux).groupBy('id_vendedor').getRawMany().then(dev => {
          res.send({
            vendas: vds,
            devolucoes: dev
          });     
        }).catch(err => next(err))
    }).catch(err => next(err))

    // repo.find({where: {data: MoreThan( new Date('2023-12-01'))}}).then(r => res.send(r))

  }

}

export const VendaRoute = Router();

const controller = new VendaController();
BuildRote(VendaRoute, controller); // nescessário p/ criar os EndPoints

VendaRoute.get('/get_vendas_por_forma_de_pagamento', controller.getVendasorFormaDePagamento)

export default VendaRoute;
