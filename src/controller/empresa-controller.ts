import { PageService } from '../services/PageService';
import { Response, Router } from 'express';
import { Empresas } from '../model/entity/empresas';
import { BuildRote, Controller, getByModel, TypedRequestBody } from './common/ControllerBase';
export class EmpresaController implements Controller<Empresas> {
    getByModel(req: TypedRequestBody<Empresas>, res: Response<any, Record<string, any>>, next: any) {
        getByModel(req, res, next, new PageService<Empresas>(new Empresas(), req.headers["cnpj"] as string))
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }
}

const empresaRoute = Router();

const empresaController = new EmpresaController();

BuildRote(empresaRoute, empresaController);

export default empresaRoute;


