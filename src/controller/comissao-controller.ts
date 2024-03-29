import { VendaItemComissao } from './../regra-de-negocio/comissao/VendaItemComissao';
import { Venda } from "./../model/entity/Venda";
import { ComissaoWorker } from "./service/comissao-worker";
import { VendaItem } from "../model/entity/VendaItem";
import { Vendedor } from "../model/entity/Vendedor";
import { Page } from "../model/apoio/page";
import { Produto } from "../model/entity/Produto";
import { GrupoProduto } from "../model/entity/GrupoProduto";
import { TypedRequestBody } from "./common/ControllerBase";
import { NextFunction, Response, Request, Router } from "express";
import { Cliente } from '../model/entity/Cliente';
import { getDBConnection } from '../services/data-config-services/db-connection.service';
import { ComissaoDecrescente } from '../regra-de-negocio/comissao/ComissaoHandlerImplementacoes';

export class ComissaoController {

  renderAnaliticoPorFormaDePagamento(req: Request, res: Response, next: NextFunction) {
    res.render('AnaliticoPorFormaDePagamento',
      {
        cnpj: req.headers['cnpj'], idVenda: req.query.idVenda ? req.query.idVenda : '',
        idProduto: req.query.idProduto ? req.query.idProduto : '',
        idCliente: req.query.idCliente ? req.query.idCliente : '',
        idGrupo: req.query.idGrupo ? req.query.idGrupo : '',
        idVendedor: req.query.idVendedor ? req.query.idVendedor : '',
        dataInicio: req.query.dataInicio ? req.query.dataInicio : '',
        dataFim: req.query.dataFim ? req.query.dataFim : '',
      })
  }

  getComissaoPorItem(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any): void {
    let paginacao = ComissaoController.assembleModelAndPage(req.query, getDBConnection(req.headers['cnpj'] as string));

    let work = new ComissaoWorker();

    if (paginacao.todasAsPaginas) {
      work.getComissaoPorItem(req.headers["cnpj"].toString(), paginacao.vendaItem, paginacao.page.number, paginacao.page.size, true).then(
        (result) => {
          res.status(200).send(result);
        },
        (erro) => {
          res.status(500).send(erro["message"]);
        }
      );
    } else {
      work.getComissaoPorItem(req.headers["cnpj"].toString(), paginacao.vendaItem, paginacao.page.number, paginacao.page.size, false).then(
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
    let p = ComissaoController.assembleModelAndPage(req.query, getDBConnection(req.headers['cnpj'] as string));

    let work = new ComissaoWorker();

    work.getComissaoPorIndice(p.vendaItem, req.headers["cnpj"] as string, null).then(
      (result) => {
        res.status(200).json(Array.from(result.values()));
      },
      (erro) => {
        //        console.log("getComissaoGroupByIndice", erro["stack"]);
        res.status(500).json(erro["message"]);
      }
    );
  }

  getComissaoDecrescente(req: Request, res: Response, next: NextFunction) {
    const worker = new ComissaoDecrescente();
    const conn = getDBConnection(req.headers['cnpj'] as string);
    worker.BuscarEcalcular(conn, {inicio: new Date('2023-12-01'), fim: new Date('2023-12-15')}, 'data_saida', 6, undefined, undefined, undefined).then(vi=>{
      res.send(vi)
    })

    
    // conn.getRepository(VendaItem).find({ where: { id_venda: { id: 120031 } } }).then(async vis => {
    //   let ret = [];
    //   for(let vi of vis){
    //     ret.push(await worker.calcular(vi, conn));
    //   }       
    //   res.send(ret)
    // }).catch(err => next(err))

  }

  static assembleModelAndPage(params, conn): { vendaItem: VendaItem; page: Page<VendaItem>; todasAsPaginas: Boolean } {
    //  console.log("assembleModelAndPage ", params);
  
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
  
    idVendedor = params.idVendedor;
    sizePage = params.sizePage ? params.sizePage : 50;
    numberPage = params.numberPage ? params.numberPage : 0;
    idProduto = params.idProduto || null;
    idGrupo = params.idGrupo || null;
  
    todasAsPaginas = params.todasAsPaginas ? params.todasAsPaginas : false;
  
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
    venda.id_cliente = params.idCliente ? conn.getRepository(Cliente).create({ id: parseInt(params.idCliente) }) : undefined;
  
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
    //  // console.log(vendaItem, '\n', page)
    return { vendaItem, page, todasAsPaginas };
  }
}

export const ComissaoRoute = Router();

const controller = new ComissaoController();

//** data requests */
ComissaoRoute.get("/get_comissao_por_item", controller.getComissaoPorItem);

ComissaoRoute.get("/get_comissao_group_by_indice", controller.getComissaoGroupByIndice);
ComissaoRoute.get('/get_comissao_decrescente', controller.getComissaoDecrescente);

//** renders requests */
ComissaoRoute.get("/get_analitico_por_forma_de_pagamento", controller.renderAnaliticoPorFormaDePagamento);

export default ComissaoRoute;
