import { VendaItemComissao } from './../regra-de-negocio/comissao/VendaItemComissao';
import { Venda } from "./../model/entity/Venda";
import { ComissaoWorker } from "./service/comissao-worker";
import { VendaItem } from "../model/entity/VendaItem";
import { Vendedor } from "../model/entity/Vendedor";
import { Page } from "../model/apoio/page";
import { Produto } from "../model/entity/Produto";
import { GrupoProduto } from "../model/entity/GrupoProduto";
import { TypedRequestBody } from "./common/ControllerBase";
import { Response, Router } from "express";

export class ComissaoController {
  getComissaoPorItem(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any): void {
    let p = assembleModelAndPage(req.query);
    
    let work = new ComissaoWorker();

    if (p.todasAsPaginas) {
      let retorno: Page<VendaItemComissao>;
        work.getComissaoListaTotal(req.headers["cnpj"].toString(), p.page.size, p.page.number, p.vendaItem, retorno).then(
          (result) => {
            res.status(200).send(result);
          },
          (erro) => {
            res.status(500).send(erro["message"]);
          }
        );
    } else {
      work.getComissaoPorItem(req.headers["cnpj"].toString(), p.vendaItem, p.page.number, p.page.size).then(
        (result) => {
          res.status(200).send(result);
        },
        (erro) => {
          res.status(500).send(erro["message"]);
        }
      );
    }
    
   
  }

  getComissaoGroupByIndice(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any): void {
    let p = assembleModelAndPage(req.query);

    let work = new ComissaoWorker();

    work.getComissaoPorIndice(p.vendaItem, req.headers["cnpj"] as string, null).then(
      (result) => {
        res.status(200).json(Array.from(result.values()));
      },
      (erro) => {
        console.log("getComissaoGroupByIndice", erro["stack"]);
        res.status(500).json(erro["message"]);
      }
    );
  }
}

function assembleModelAndPage(params): { vendaItem: VendaItem; page: Page<VendaItem>; todasAsPaginas: Boolean } {
  console.log("assembleModelAndPage ", params);

  let dataInicio: Date;
  let dataFim: Date;
  let idVendedor;
  let sizePage;
  let numberPage;
  let idProduto;
  let idGrupo;
  let todasAsPaginas: Boolean;

  if (!params["dataInicio"] || !params["dataFim"]) throw new TypeError("Deve obrigatoriamente informar a data de inicio(dataInicio) e fim(dataFim) no formato ISO(YYYY-MM-DDThh:mm:ss)");

  try {
    dataInicio = new Date(params.dataInicio as string);
    dataFim = new Date(params.dataFim as string);
  } catch (error) {
    throw new TypeError("Não foi possível realizar o parse da data informada. Causa: " + error["message"]);
  }

  idVendedor = params?.idVendedor;
  sizePage = params?.sizePage ?? 50;
  numberPage = params?.numberPage ?? 0;
  idProduto = params?.idProduto || null;
  idGrupo = params?.idGrupo || null;

  todasAsPaginas = params?.todasAsPaginas ?? false;

  if (!dataInicio || !dataFim) throw new TypeError("Deve obrigatoriamente informar a data de inicio(dataInicio) e fim(dataFim) no formato ISO(YYYY-MM-DDThh:mm:ss)");

  if (!idVendedor) throw new TypeError("Deve obrigatoriamente informar o código do vendedor.");

  let vendaItem = new VendaItem();

  let venda = new Venda();

  venda.nf_uniao = false;
  venda.gerado = "SIM";
  venda.id_vendedor = new Vendedor();
  venda.id_vendedor.id = parseInt(idVendedor);
  venda.data_saida = new Date(JSON.stringify(dataInicio));
  venda.data_saida["inicio"] = dataInicio;
  venda.data_saida["fim"] = dataFim;

  if (idProduto) {
    vendaItem.id_produto = new Produto();
    vendaItem.id_produto.id = parseInt(idProduto);
  }
  if (idGrupo) {
    if (idProduto) {
      vendaItem.id_produto.id_grupo = new GrupoProduto();
      vendaItem.id_produto.id_grupo.id = parseInt(idGrupo);
    } else {
      vendaItem.id_produto = new Produto();
      vendaItem.id_produto.id_grupo = new GrupoProduto();
      vendaItem.id_produto.id_grupo.id = parseInt(idGrupo);
    }
  }

  let page = new Page<VendaItem>();
  page.content = [];
  page.number = parseInt(numberPage);
  page.size = parseInt(sizePage);

  vendaItem.id_venda = venda;
  // console.log(vendaItem, '\n', page)
  return { vendaItem, page, todasAsPaginas};
}

export const ComissaoRoute = Router();

const controller = new ComissaoController();

ComissaoRoute.get("/get_comissao_por_item", controller.getComissaoPorItem);
ComissaoRoute.get("/get_comissao_group_by_indice", controller.getComissaoGroupByIndice);

export default ComissaoRoute;
