import { Router } from 'express';
import { PageService } from './../service/PageService';
import { Response } from 'express';
import { Vendedor } from './../model/entity/Vendedor';
import { BuildRote, Controller, getByModel, TypedRequestBody } from './common/ControllerBase';
export class VendedorController implements Controller<Vendedor> {
    getByModel(req: TypedRequestBody<Vendedor>, res: Response<any, Record<string, any>>, next: any) {
        return getByModel(req, res, next, new PageService(new Vendedor(), req.headers["cnpj"] as string) )
    }
    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error('Method not implemented.');
    }
}


export const vendedorRoute = Router();

BuildRote(vendedorRoute, new VendedorController());

export default vendedorRoute;
