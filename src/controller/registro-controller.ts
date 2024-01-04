import { registro } from '../model/entity/registro';
import { Response, Router } from "express";
import { BuildRote, Controller, TypedRequestBody, getByModel } from "./common/ControllerBase";
import { PageService } from '../services/PageService';

export class RegistroController implements Controller<registro> {
    getByModel(req: TypedRequestBody<registro>, res: Response, next: any) {
        return getByModel(req, res, next, new PageService(new registro(), req.headers["cnpj"] as string));
    }

    getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; }>, res: Response<any, Record<string, any>>, next: any) {
        throw new Error("Method not implemented.");
    }
}

/**
 * @description RegistroRoute é o ponto de entrada da aplicação aqui é adiciondado o Registro de todos os endpoints desse controller
 */
export const RegistroRoute = Router();

BuildRote(RegistroRoute, new RegistroController()); // nescessário p/ criar os EndPoints
// RegistroRoute.post('/get_by_model', new RegistroController().getByModel)

export default RegistroRoute;