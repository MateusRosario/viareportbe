import { Router } from 'express';
import { BuildRote, Controller, getByModel, TypedRequestBody } from './common/ControllerBase';
import { Produto } from '../model/entity/Produto';
import { Response } from 'express';
import { PageService } from '../service/PageService';

export class ProdutoController implements Controller<Produto> {
    getByModel(req: TypedRequestBody<Produto>, res: Response<any, Record<string, any>>, next: any) {
        return getByModel(req, res, next, new PageService<Produto>(new Produto(), req.headers["cnpj"] as string));
        
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }

}

export const ProdutoRoute = Router();
const controller = new ProdutoController()
BuildRote(ProdutoRoute, controller); // nescessário p/ criar os EndPoints

export default ProdutoRoute;