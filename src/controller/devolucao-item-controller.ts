import { Response, Router } from 'express';
import { DevolucaoItem } from './../model/entity/devolucao-item';
import { BuildRote, Controller, TypedRequestBody, getByModel } from './common/ControllerBase';
import { PageService } from '../services/PageService';

export class DevolucaoItemController implements Controller<DevolucaoItem>{
    getByModel(req: TypedRequestBody<DevolucaoItem>, res: Response<any, Record<string, any>>, next: any) {
        return getByModel(req, res, next, new PageService(new DevolucaoItem(), req.headers['cnpj'] as string));
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }

}

export const DevolucaoItemRouter = Router();

const controller = new DevolucaoItemController();
BuildRote(DevolucaoItemRouter, controller);

export default DevolucaoItemRouter;