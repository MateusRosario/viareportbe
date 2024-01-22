import { DevolucaoItem } from "../../model/entity/devolucao-item";
import { Page } from "../../model/apoio/page";
import { VendaItem } from "../../model/entity/VendaItem";
import { ComissaoAdapterProvider, getComissaoHandlerOrder } from "../../regra-de-negocio/comissao/ComissaoHandlerImplementacoes";
import { ComissaoTipo, VendaItemComissao, VendaStatus } from "../../regra-de-negocio/comissao/VendaItemComissao";
import { BuidWhereByModel } from "../../repository/common/QueryUtils";
import { getDBConnection } from "../../services/data-config-services/db-connection.service";
import { isValid } from "../../services/FunctionsServices";
import { somaVT } from "../../helpers/ArithmeticOperators";
import { DataSource } from "typeorm";

var contador: number = 0;

export class ComissaoWorker {
  private meuContador: number;

  constructor() {
    this.meuContador = contador;
    contador++;
  }
  async getComissaoPorItem(cnpj: string, vendaItem: VendaItem, numberPage: number = 0, sizePage: number = 50, all = false): Promise<Page<VendaItemComissao>> {
//    console.log("===========================contador(getComissaoPorItem): ", this.meuContador);
    return this.getComissaoLista(cnpj, sizePage, numberPage, vendaItem, undefined, all);

    // return await this.concatCanceladasAndDevolvidas(cnpj, sizePage, numberPage, vendaItem, itens);
  }

  async getComissaoPorIndice(vendaItem: VendaItem, cnpj: string, retorno: Map<string, ComissaoIndiceDicitionary>): Promise<Map<string, ComissaoIndiceDicitionary>> {
//    console.log("===========================contador(getComissaoPorIndice): ", this.meuContador);
    let map = new Map<string, ComissaoIndiceDicitionary>();

    await this.getComissaoListaTotal(cnpj, 1000, 0, vendaItem, null).then((lista) => {
      if (lista.content.length > 0) {
        // Separa por diferenteis percentuais de comissão
        lista.content.forEach((item, index) => {
          let comissaoIndice = map.get(item.comissao_indice + item.comissao_percentual.toString());

          // Se comissaoIndice ainda não está no map
          if (!isValid(comissaoIndice)) {
            comissaoIndice = new ComissaoIndiceDicitionary();
            comissaoIndice.descricaoDoIndice = item.comissao_indice;
            comissaoIndice.comissao = somaVT([item.comissao_valor, comissaoIndice.comissao], 4);
            comissaoIndice.percentual = item.comissao_percentual;
            comissaoIndice.total = somaVT([comissaoIndice.total, item.vl_total], 4);

            map.set(comissaoIndice.descricaoDoIndice + comissaoIndice.percentual, comissaoIndice);
          } else {
            comissaoIndice.comissao = somaVT([item.comissao_valor, comissaoIndice.comissao], 4);
            comissaoIndice.total = somaVT([comissaoIndice.total, item.vl_total], 4);
          }
        });

      }
    });

    // map.forEach((indice) => {
    //   indice.percentual = indice.comissao * 100 / indice.total;
    // })

    return map;
  }

  async getComissaoLista(cnpj: string, sizePage: number, numberPage: number, vendaItem: VendaItem, page: Page<VendaItemComissao>, all: boolean): Promise<Page<VendaItemComissao>> {

    // Inicialização da página
    if (!isValid(page)) {
      page = new Page<VendaItemComissao>();
      page.content = [];
    }

    // Carregando primeira página
    await this.getComissaoListaNormal(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
      page.number = lista.number;
      page.content = page.content.concat(lista.content);
      page.length = lista.length;
      page.size = lista.size;
    });

    // Carrega páginas restantes por recursão ou carrega devoluções e cancelamentos
    if(all && page.hasMorePages()) {
      return await this.getComissaoLista(cnpj, sizePage, page.getNextPage().number, vendaItem, page, all);
    } else if(all || !page.hasMorePages()) {
      return await this.concatCanceladasAndDevolvidas(cnpj, sizePage, numberPage, vendaItem, page);
    } else {
      return page;
    }
  }

  async getComissaoListaTotal(cnpj: string, sizePage: number, numberPage: number, vendaItem: VendaItem, retorno: Page<VendaItemComissao>): Promise<Page<VendaItemComissao>> {
//    console.log("===========================contador(getComissaoListaTotal): ", this.meuContador);
    if (!isValid(retorno)) {
//      console.log("=================================================================================Foi necessário instanciar o retorno");
      retorno = new Page<VendaItemComissao>();
      retorno.content = [];
    }

    await this.getComissaoListaNormal(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
//      console.log("===========================contador(getComissaoListaNormal)-TERMINOU: ", this.meuContador);
      retorno.number = lista.number;
      retorno.content = retorno.content.concat(lista.content);
      retorno.length = lista.length;
      retorno.size = lista.size;
    });

    let list;
    if (retorno.hasMorePages()) {
//      console.log("TERM MAIS PÁGINAS");
      list = await this.getComissaoListaTotal(cnpj, sizePage, retorno.getNextPage().number, vendaItem, retorno);
    } else {
      list = await this.concatCanceladasAndDevolvidas(cnpj, sizePage, numberPage, vendaItem, retorno);
    }
//    console.log("===========================contador(getComissaoListaTotal)-TERMINOU: ", this.meuContador);
    return list;
  }

  private async getComissaoListaNormal(cnpj: string, sizePage: number, numberPage: number, vendaItem: VendaItem): Promise<Page<VendaItemComissao>> {
//    console.log("===========================contador(getComissaoListaNormal): ", this.meuContador);
    let itensNormal = new Page<VendaItemComissao>();
    itensNormal.content = [];

    const pageNormais = new Page<VendaItem>();
    pageNormais.size = sizePage;
    pageNormais.number = numberPage;

    const comissaoHandler = getComissaoHandlerOrder();

    let sqlVendaNormal = getDBConnection(cnpj)
      .getRepository(VendaItem)
      .createQueryBuilder("vi")
      .innerJoinAndSelect("vi.id_venda", "v")
      .innerJoinAndSelect("vi.id_produto", "p")
      .leftJoinAndSelect("p.id_grupo", "gp")
      .innerJoinAndSelect("v.id_vendedor", "vend")
      .innerJoinAndSelect("v.id_forma", "fp")
      .innerJoinAndSelect("v.id_cliente", "c")
      .where(BuidWhereByModel(getDBConnection(cnpj).getRepository(VendaItem).create(vendaItem), cnpj))
      .orderBy("v.data_saida asc, v.id asc, vi.id")
      .offset(pageNormais.getOffset())
      .limit(pageNormais.size);

    // console.log(sqlVendaNormal.getQueryAndParameters());

    return await sqlVendaNormal.getManyAndCount().then((value) => {
      // if (value[0].length === 50 ) console.log(value[0][0]);
      pageNormais.content = value[0];
      pageNormais.length = value[1];
      pageNormais.contentLength = pageNormais.content.length;

      pageNormais.content.forEach((item) => {
        const comissao = new VendaItemComissao();

        comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.NORMAL), comissao);
        
        comissao.cliente = {
          id: item?.id_venda?.id_cliente?.id,
          nome: item?.id_venda?.id_cliente.nome
        };
        itensNormal.content.push(comissao);
      });

      // console.log(itensNormal.content);

      itensNormal.length = pageNormais.length;
      itensNormal.number = pageNormais.number;
      itensNormal.size = pageNormais.size;
      itensNormal.sort = pageNormais.sort;
      itensNormal.contentLength = pageNormais.contentLength;

      return itensNormal;
    });
  }

  async getComissaoListaCancelada(cnpj: string, sizePage: number, numberPage: number, vendaItem: VendaItem): Promise<Page<VendaItemComissao>> {
//    console.log("===========================contador(getComissaoListaCancelada): ", this.meuContador);
    let itensCancelados = new Page<VendaItemComissao>();
    itensCancelados.content = [];

    const page = new Page<VendaItem>();
    page.size = sizePage;
    page.number = numberPage;

    const comissaoHandler = getComissaoHandlerOrder();

    let copyVendaItem: VendaItem = JSON.parse(JSON.stringify(vendaItem));

    copyVendaItem.id_venda.data_cancelamento = null // { inicio: vendaItem.id_venda.data_saida["inicio"], fim: vendaItem.id_venda.data_saida["fim"] };
    copyVendaItem.id_venda.cancelada = "SIM";
    copyVendaItem.id_venda.data_saida = null; 

    let sqlVendaCancelada = getDBConnection(cnpj)
      .getRepository(VendaItem)
      .createQueryBuilder("vi")
      .innerJoinAndSelect("vi.id_venda", "v")
      .innerJoinAndSelect("vi.id_produto", "p")
      .leftJoinAndSelect("p.id_grupo", "gp")
      .innerJoinAndSelect("v.id_vendedor", "vend")
      .innerJoinAndSelect("v.id_forma", "fp")
      .where(BuidWhereByModel(getDBConnection(cnpj).getRepository(VendaItem).create(copyVendaItem), cnpj))
      .orderBy("v.data_saida asc, v.id");
    
    // console.log(sqlVendaCancelada.getQueryAndParameters());

    return await sqlVendaCancelada.getManyAndCount().then((value) => {
      page.content = value[0];
      page.length = value[1];
      page.contentLength = page.content.length;

      page.content.forEach((item) => {
        const comissao = new VendaItemComissao();
        
        if(new Date(item.id_venda.data_saida) < vendaItem.id_venda.data_saida["inicio"]) {
          comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.CANCELADA_FP), comissao);
        } else {
          comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.CANCELADA), comissao);
        }

        itensCancelados.content.push(comissao);
      });

      itensCancelados.length = page.length;
      itensCancelados.number = page.number;
      itensCancelados.size = page.size;
      itensCancelados.sort = page.sort;
      itensCancelados.contentLength = page.contentLength;

//      // console.log(itensCancelados);

      return itensCancelados;
    });
  }

  async getComissaoListaDevolvido(cnpj: string, sizePage: number, numberPage: number, vendaItem: VendaItem): Promise<Page<VendaItemComissao>> {
    let itensDevolvidos = new Page<VendaItemComissao>();
    itensDevolvidos.content = [];

    const pageDevolvidas = new Page<DevolucaoItem>();
    pageDevolvidas.size = sizePage;
    pageDevolvidas.number = numberPage;

    const comissaoHandler = getComissaoHandlerOrder();

    let sqlDevolucao = getDBConnection(cnpj)
      .getRepository(DevolucaoItem)
      .createQueryBuilder("di")
      .innerJoinAndSelect("di.id_devolucao", "d")
      .innerJoinAndSelect("di.id_produto", "p")
      .leftJoinAndSelect("p.id_grupo", "gp")
      .leftJoinAndSelect("d.id_pedido", "v")
      .innerJoinAndSelect("v.id_vendedor", "vend")
      .innerJoinAndSelect("v.id_forma", "fp")
      .where("d.data between :dataInicio and :dataFim and d.tipo = :tipo and v.id_vendedor = :id_vendedor", {
        dataInicio: vendaItem.id_venda.data_saida["inicio"],
        dataFim: vendaItem.id_venda.data_saida["fim"],
        tipo: "1",
        id_vendedor: vendaItem.id_venda.id_vendedor.id,
      });

    // console.log(sqlDevolucao.getQueryAndParameters());

    return await sqlDevolucao.getManyAndCount().then((value) => {
      pageDevolvidas.content = value[0];
      pageDevolvidas.length = value[1];
      pageDevolvidas.contentLength = pageDevolvidas.content.length;

      pageDevolvidas.content.forEach((item) => {
        const comissao = new VendaItemComissao();

        if(new Date(item.id_devolucao.id_pedido.data_saida) < vendaItem.id_venda.data_saida["inicio"]) {
          comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.DEVOLVIDA_FP), comissao);
        } else {
          comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.DEVOLVIDA), comissao);
        }

        itensDevolvidos.content.push(comissao);
      });

      itensDevolvidos.length = pageDevolvidas.length;
      itensDevolvidos.number = pageDevolvidas.number;
      itensDevolvidos.size = pageDevolvidas.size;
      itensDevolvidos.sort = pageDevolvidas.sort;
      itensDevolvidos.contentLength = pageDevolvidas.contentLength;

//      // console.log(itensDevolvidos);
      return itensDevolvidos;
    });
  }

  async getComissaoNormalTotalizadores(cnpj: string, vendaItem: VendaItem) {

  }

  async concatCanceladasAndDevolvidas(cnpj, sizePage, numberPage, vendaItem, list): Promise<Page<VendaItemComissao>> {
    await this.getComissaoListaCancelada(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
    //        console.log("===========================contador(getComissaoListaCancelada)-TERMINOU: ", this.meuContador);
      list.content = list.content.concat(lista.content);
      list.length += lista.length;
    });

    await this.getComissaoListaDevolvido(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
      list.content = list.content.concat(lista.content);
      list.length += lista.length;
    });

    return list;
  }
}

class ComissaoIndiceDicitionary {
  descricaoDoIndice: string;
  total: number = 0.0;
  percentual: number = 0.0;
  comissao: number = 0.0;
}
