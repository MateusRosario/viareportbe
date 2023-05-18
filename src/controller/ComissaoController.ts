import { BuildPage, TypedRequestBody } from "./common/ControllerBase";
import { Page } from "./../model/apoio/page";
import { VendaItem } from "./../model/entity/VendaItem";
import { PageService } from "./../service/PageService";
import { Request, Response, Router } from "express";
import { isValid } from "../service/FunctionsServices";
import { multiplicarVT } from "../Helpers/ArithmeticOperators";
import { VendaItemComissao } from "../regra-de-negocio/comissao/VendaItemComissao";
import { getComissaoHandlerOrder } from "../regra-de-negocio/comissao/ComissaoHandlerImplementacoes";
import { httpException } from "../model/exceptions/httpExceptions";



export class ComissaoController {
  getComissaoPorItem(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any): void {
    let service = new PageService<VendaItem>(new VendaItem());
    let page = BuildPage<VendaItem>(req);
    let itens = new Page<VendaItemComissao>();
    itens.content = [];
    console.log(req.body);
    try {
        const comissaoHandler = getComissaoHandlerOrder();

         
        service.findByExemple(req.body, page).then((_page) => {
        _page.content.forEach((item) => {
            const comissao = new VendaItemComissao();
            comissaoHandler.calcularComissao(item, comissao);
            itens.content.push(comissao);
        });

        itens.length = _page.length;
        itens.number = _page.number;
        itens.size = _page.size;
        itens.sort = _page.sort;

        res.status(200).send(itens);
      });
    } catch (error) {
        next(new httpException(500, error["message"]));
    }
  }
}

export const ComissaoRoute = Router();

const controller = new ComissaoController();

ComissaoRoute.post("/get_comissao_por_item", controller.getComissaoPorItem);

export default ComissaoRoute;
