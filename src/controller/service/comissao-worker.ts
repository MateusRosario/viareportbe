import { DevolucaoItem } from "../../model/entity/devolucao-item";
import { Page } from "../../model/apoio/page";
import { VendaItem } from "../../model/entity/VendaItem";
import { ComissaoAdapterProvider, getComissaoHandlerOrder } from "../../regra-de-negocio/comissao/ComissaoHandlerImplementacoes";
import { VendaItemComissao, VendaStatus } from "../../regra-de-negocio/comissao/VendaItemComissao";
import { BuidWhereByModel } from "../../repository/common/QueryUtils";
import { getDBConnection } from "../../services/data-config-services/db-connection.service";
import { isValid } from "../../services/FunctionsServices";
import { somaVT } from "../../helpers/ArithmeticOperators";

var contador: number = 0;

export class ComissaoWorker {
  private meuContador: number;

  constructor() {
    this.meuContador = contador;
    contador++;
  }
  async getComissaoPorItem(cnpj: string, vendaItem: VendaItem, numberPage: number = 0, sizePage: number = 50): Promise<Page<VendaItemComissao>> {
//    console.log("===========================contador(getComissaoPorItem): ", this.meuContador);
    return this.getComissaoListaNormal(cnpj, sizePage, numberPage, vendaItem);
  }

  async getComissaoPorIndice(vendaItem: VendaItem, cnpj: string, retorno: Map<string, ComissaoIndiceDicitionary>): Promise<Map<string, ComissaoIndiceDicitionary>> {
//    console.log("===========================contador(getComissaoPorIndice): ", this.meuContador);
    let map = new Map<string, ComissaoIndiceDicitionary>();

    await this.getComissaoListaTotal(cnpj, 1000, 0, vendaItem, null).then((lista) => {
      if (lista.content.length > 0) {


        lista.content.forEach((item, index) => {
          let key = map.get(item.comissao_indice + item.comissao_percentual.toString());

          if (!isValid(key)) {
            key = new ComissaoIndiceDicitionary();
            key.descricaoDoIndice = item.comissao_indice;
            key.comissao = somaVT([item.comissao_valor, key.comissao], 2);
            key.percentual = item.comissao_percentual;
            key.total = somaVT([key.total, item.vl_total], 2);

            map.set(key.descricaoDoIndice + key.percentual, key);
          } else {
            key.comissao = somaVT([item.comissao_valor, key.comissao], 2);
            key.total = somaVT([key.total, item.vl_total], 2);
          }
        });

      }
    });

    return map;
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

    if (retorno.hasMorePages()) {
//      console.log("TERM MAIS PÁGINAS");
      return await this.getComissaoListaTotal(cnpj, sizePage, retorno.getNextPage().number, vendaItem, retorno);
    } else {
      await this.getComissaoListaCancelada(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
//        console.log("===========================contador(getComissaoListaCancelada)-TERMINOU: ", this.meuContador);
        retorno.content = retorno.content.concat(lista.content);
        retorno.length += lista.length;
      });

      await this.getComissaoListaDevolvido(cnpj, sizePage, numberPage, vendaItem).then((lista) => {
        retorno.content = retorno.content.concat(lista.content);
        retorno.length += lista.length;
      });
    }
//    console.log("===========================contador(getComissaoListaTotal)-TERMINOU: ", this.meuContador);
    return retorno;
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

//    // if (pageNormais.size === 50) console.log("<><><><><><><>", sqlVendaNormal.getQueryAndParameters());

    return await sqlVendaNormal.getManyAndCount().then((value) => {
//      // if (value[0].length === 50 ) console.log(value[0][0]);
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
    const pageCanceladas = new Page<VendaItem>();
    pageCanceladas.size = sizePage;
    pageCanceladas.number = numberPage;

    const comissaoHandler = getComissaoHandlerOrder();

    let copyVendaItem: VendaItem = JSON.parse(JSON.stringify(vendaItem));

    copyVendaItem.id_venda.data_cancelamento = { inicio: vendaItem.id_venda.data_saida["inicio"], fim: vendaItem.id_venda.data_saida["fim"] };
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

    return await sqlVendaCancelada.getManyAndCount().then((value) => {
      pageCanceladas.content = value[0];
      pageCanceladas.length = value[1];
      pageCanceladas.contentLength = pageCanceladas.content.length;

      pageCanceladas.content.forEach((item) => {
        const comissao = new VendaItemComissao();
        comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.CANCELADA), comissao);

        itensCancelados.content.push(comissao);
      });

      itensCancelados.length = pageCanceladas.length;
      itensCancelados.number = pageCanceladas.number;
      itensCancelados.size = pageCanceladas.size;
      itensCancelados.sort = pageCanceladas.sort;
      itensCancelados.contentLength = pageCanceladas.contentLength;

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

    return await sqlDevolucao.getManyAndCount().then((value) => {
      pageDevolvidas.content = value[0];
      pageDevolvidas.length = value[1];
      pageDevolvidas.contentLength = pageDevolvidas.content.length;

      pageDevolvidas.content.forEach((item) => {
        const comissao = new VendaItemComissao();
        comissaoHandler.calcularComissao(ComissaoAdapterProvider(item, VendaStatus.CANCELADA), comissao);

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
}

class ComissaoIndiceDicitionary {
  descricaoDoIndice: string;
  total: number = 0.0;
  percentual: number = 0.0;
  comissao: number = 0.0;
}
