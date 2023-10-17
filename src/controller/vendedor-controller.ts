import { response, Router } from 'express';
import { PageService } from './../service/PageService';
import { Response } from 'express';
import { Vendedor } from './../model/entity/Vendedor';
import { BuildRote, Controller, getByModel, TypedRequestBody } from './common/ControllerBase';
import { getConnection } from '../data-source';
import { DataSource } from 'typeorm';
import { VendedorService } from './service/VendedorService';
export class VendedorController implements Controller<Vendedor> {
    getByModel(req: TypedRequestBody<Vendedor>, res: Response<any, Record<string, any>>, next: any) {
        return getByModel(req, res, next, new PageService(new Vendedor(), req.headers["cnpj"] as string))
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }

    getVendasPorVendedor(req: TypedRequestBody<any>, res: Response, next: any) {
        let data: {
            inicio: string,
            fim: string
        } = {
            inicio: undefined,
            fim: undefined
        };

        if (req.query["dataInicio"] === undefined || req.query["dataFim"] === undefined) {
            res.status(400).send('Data não informada');
            next(new Error('Data não informada'));
            return;
        }

        data.inicio = req.query["dataInicio"] as string;
        data.fim = req.query["dataFim"] as string;

        new VendedorService().getVendasPorVendedor(req.headers['cnpj'] , data).then(response => {
            res.status(200).send(response);
        }).catch(err => {
            if(err.message === 'Nada Encontrado nessa data!') return res.status(404).send([])
            return next(err)
        })


    }
}

export function dateFormat(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
}

export const vendedorRoute = Router();
const controller = new VendedorController();
BuildRote(vendedorRoute, controller);
vendedorRoute.get('/vendas', controller.getVendasPorVendedor)

export default vendedorRoute;
