import { Devolucao } from './../model/entity/devolucao';
import { NextFunction, Request, Response, Router } from 'express';
import { BuildRote, Controller, TypedRequestBody, getByModel } from './common/ControllerBase';
import { PageService } from '../services/PageService';
import { getDBConnection } from '../services/data-config-services/db-connection.service';
import { Between, In } from 'typeorm';
import { DevolucaoVendaViewm } from '../model/entity/devolucao-venda-viewm';
import { DevolucaoItemView } from '../model/apoio/devolucao-item-view';

export class DevolucaoController implements Controller<Devolucao>{
    getByModel(req: TypedRequestBody<Devolucao>, res: Response<any, Record<string, any>>, next: any) {
        return getByModel(req, res, next, new PageService(new Devolucao(), req.headers['cnpj'] as string))
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }
    getDevolucoesPorVendedor(req: Request, res: Response, next: NextFunction) {
        const conn = getDBConnection(req.headers['cnpj'] as string);
        const dt = {
            ini: req.query['dataInicio'] as string,
            fim: req.query['dataFim'] as string
        };

        let where = { data: Between(new Date(dt.ini), new Date(dt.fim)) };

        if (req.query['idVendedor']) {
            where['id_vendedor'] = req.query.idVendedor
        }
        conn.query("REFRESH MATERIALIZED VIEW public.devolucao_venda_viewm;").then(() => {
            const repo = conn.getRepository(DevolucaoVendaViewm);
            let qry = repo.find({ where: where })

            qry.then( async d => {
                const diRepository = conn.getRepository(DevolucaoItemView);
                const items = await diRepository.find({where: {id_devolucao: In(d.map((el)=> el.id))}})

                res.send({
                    devolucoes: d,
                    itens: items
                });
            }).catch(err => next(err));
        }).catch(err => next(err));
    }
}

export const DevolucaoRouter = Router();

const controller = new DevolucaoController()

//** data requests */
BuildRote(DevolucaoRouter, controller);

DevolucaoRouter.get('/devolucoes_por_vendedor', controller.getDevolucoesPorVendedor)

export default DevolucaoRouter;