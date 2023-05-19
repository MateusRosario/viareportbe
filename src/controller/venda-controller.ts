import { PageService } from "../service/PageService";
import { Response, Router } from "express";
import { Venda } from "../model/entity/Venda";
import { BuildRote, Controller, getByModel, TypedRequestBody } from "./common/ControllerBase";

export class VendaController implements Controller<Venda> {
  getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; numberPage: number }>, res: Response<any, Record<string, any>>, next: any) {
    throw new Error("Method not implemented.");
  }

  getByModel(req: TypedRequestBody<Venda>, res: Response<any, Record<string, any>>, next: any) {
    getByModel(req, res, next, new PageService<Venda>(new Venda()));
  }

 
}

export const VendaRoute = Router();

BuildRote(VendaRoute, new VendaController()); // nescessário p/ criar os EndPoints
// RegistroRoute.post('/get_by_model', new RegistroController().getByModel)

export default VendaRoute;
