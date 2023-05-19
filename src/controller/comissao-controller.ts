import { ComissaoWorker } from "./facade/comissao-worker";
import { BuildPage, TypedRequestBody } from "./common/ControllerBase";
import { VendaItem } from "../model/entity/VendaItem";
import { Response, Router } from "express";
import { httpException } from "../model/exceptions/httpExceptions";

export class ComissaoController {
  getComissaoPorItem(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any): void {
    console.log(req.body);

    const work = new ComissaoWorker();

    let page = BuildPage(req);

    work.getComissaoPorItem(req.body, page.number, page.size).then(
      (result) => {
        res.status(200).send(result);
      },
      (erro) => {
        next(new httpException(500, erro["message"]));
      }
    );
  }
}

export const ComissaoRoute = Router();

const controller = new ComissaoController();

ComissaoRoute.post("/get_comissao_por_item", controller.getComissaoPorItem);

export default ComissaoRoute;
