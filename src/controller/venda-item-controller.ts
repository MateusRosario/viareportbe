
import { PageService } from "../services/PageService";
import { Response, Router } from "express";
import { VendaItem } from "../model/entity/VendaItem";
import { BuildRote, Controller, getByModel, TypedRequestBody } from "./common/ControllerBase";

export class VendaItemController implements Controller<VendaItem> {
  getByModel(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any) {
    getByModel(req, res, next, new PageService<VendaItem>(new VendaItem(), req.headers["cnpj"] as string));
  }
  getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; numberPage: number }>, res: Response<any, Record<string, any>>, next: any) {
    throw new Error("Method not implemented.");
  }

}

export const VendaItemRoute = Router();

const vendaItemController = new VendaItemController();

BuildRote(VendaItemRoute, vendaItemController);

export default VendaItemRoute;
