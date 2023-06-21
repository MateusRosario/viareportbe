import { DevolucaoItem } from "./../../model/entity/devolucao-item";
import Decimal from "decimal.js";
import { multiplicarVT } from "../../Helpers/ArithmeticOperators";
import { FormaPagamento } from "../../model/entity/FormaPagamento";
import { Produto } from "../../model/entity/Produto";
import { VendaItem } from "../../model/entity/VendaItem";
import { Vendedor } from "../../model/entity/Vendedor";
import { isValid } from "../../service/FunctionsServices";
import { IComissaoAdapter, ComissaoHandlerBase, ComissaoHandlerInterface } from "./ComissaoHandler";
import { ComissaoTipo, VendaItemComissao, VendaStatus } from "./VendaItemComissao";
import { Venda } from "../../model/entity/Venda";

export class ComissaoProdutoHandler extends ComissaoHandlerBase {
  protected ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (!item.getProduto().gera_comissao) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_SEM_COMISSAO;
      valorComissao.comissao_valor = 0.0;
    } else if (item.getProduto().comissao > 0.0) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_COM_RESTRICAO;
      valorComissao.comissao_valor = multiplicarVT([Decimal.div(item.getProduto().comissao, 100).toNumber(), item.getValorLiquido()]);
      valorComissao.comissao_percentual = item.getProduto().comissao;
    } else processou = false;

    return processou;
  }
}

class ComissaoAdapterVendaItem implements IComissaoAdapter {
  private fator: number = 1;

  constructor(private vendaItem: VendaItem, private vendaStatus: VendaStatus) {
    if (!vendaItem) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não instanciado.");
    if ((vendaItem.id ?? 0) === 0) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem vazio.");
    if (!vendaItem.id_produto) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não possui um produto.") + ` VendaItem (${vendaItem.id})`;
    if (!vendaItem.id_venda) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não pertence a uma venda." + ` VendaItem (${vendaItem.id})`);
    if (!vendaItem.id_venda.id_vendedor) throw new TypeError("ComissaoAdapterVendaItem: A Venda do Objeto VendaItem não possui um vendedor." + ` Venda (${vendaItem.id_venda.id})`);
    if (!vendaItem.id_venda.id_forma) throw new TypeError("ComissaoAdapterVendaItem: A Venda do Objeto VendaItem não possui uma forma de pagamento." + ` Venda (${vendaItem.id_venda.id})`);

    this.fator = this.vendaStatus === VendaStatus.CANCELADA ? -1 : 1;
  }

  getId(): number {
    return this.vendaItem.id_venda.id;
  }

  getIdItem(): number {
    return this.vendaItem.id;
  }
  getProduto(): Produto {
    return this.vendaItem.id_produto;
  }
  getVendedor(): Vendedor {
    return this.vendaItem.id_venda.id_vendedor;
  }
  getValorBruto(): number {
    return multiplicarVT([this.vendaItem.quantidade, this.vendaItem.vl_unitario, this.fator]);
  }
  getValorDesconto(): number {
    return this.vendaItem.vl_desconto;
  }
  getValorLiquido(): number {
    return multiplicarVT([this.fator, this.vendaItem.vl_total]);
  }
  getData(): Date {
    return this.vendaItem.id_venda.data_saida as Date;
  }
  getStatus(): VendaStatus {
    return this.vendaStatus;
  }
  getFormaPagamento(): FormaPagamento {
    return this.vendaItem.id_venda.id_forma;
  }
}

class ComissaoAdapterDevolucaoItem implements IComissaoAdapter {
  private fator: number = -1;

  constructor(private devolucaoItem: DevolucaoItem, private vendaStatus: VendaStatus.DEVOLVIDA) {
    if (!devolucaoItem) throw new TypeError("ComissaoAdapterDevolucaoItem: Objeto DevolucaoItem não instanciado.");
    if ((devolucaoItem.id ?? 0) === 0) throw new TypeError("ComissaoAdapterDevolucaoItem: Objeto DevolucaoItem vazio.");
    if (!devolucaoItem.id_produto) throw new TypeError("ComissaoAdapterDevolucaoItem: Objeto DevolucaoItem não possui um produto.") + ` DevolucaoItem (${devolucaoItem.id})`;
    if (!devolucaoItem.id_devolucao) throw new TypeError("ComissaoAdapterDevolucaoItem: Objeto DevolucaoItem não pertence a uma devolução." + ` DevolucaoItem (${devolucaoItem.id})`);
    if (!devolucaoItem.id_devolucao.id_pedido)
      throw new TypeError("ComissaoAdapterDevolucaoItem: A Devolução do Objeto DevolucaoItem não possui uma venda referenciada." + ` Devolucao (${devolucaoItem.id_devolucao.id})`);
    if (!devolucaoItem.id_devolucao.id_pedido.id_vendedor)
      throw new TypeError("ComissaoAdapterDevolucaoItem: A Devolução do Objeto DevolucaoItem não possui um vendedor." + ` Devolucao (${devolucaoItem.id_devolucao.id})`);
    if (!devolucaoItem.id_devolucao.id_pedido.id_forma)
      throw new TypeError("ComissaoAdapterDevolucaoItem: A Devolução do Objeto Devolucao.id_pedido não possui uma forma de pagamento." + ` Devolucao (${devolucaoItem.id_devolucao.id})`);
  }

  getId(): number {
    return this.devolucaoItem.id_devolucao.id;
  }

  getIdItem(): number {
    return this.devolucaoItem.id;
  }
  getProduto(): Produto {
    return this.devolucaoItem.id_produto;
  }
  getVendedor(): Vendedor {
    return this.devolucaoItem.id_devolucao.id_pedido.id_vendedor;
  }
  getValorBruto(): number {
    return multiplicarVT([this.devolucaoItem.quantidade, this.devolucaoItem.vl_unitario, this.fator]);
  }
  getValorDesconto(): number {
    return this.devolucaoItem.desconto;
  }
  getValorLiquido(): number {
    return multiplicarVT([this.fator, this.devolucaoItem.vl_total]);
  }
  getData(): Date {
    return this.devolucaoItem.id_devolucao.data as Date;
  }
  getStatus(): VendaStatus {
    return this.vendaStatus;
  }
  getFormaPagamento(): FormaPagamento {
    return this.devolucaoItem.id_devolucao.id_pedido.id_forma;
  }
}

export function ComissaoAdapterProvider(obj: VendaItem | DevolucaoItem, status: VendaStatus): IComissaoAdapter {
  if (obj instanceof VendaItem) return new ComissaoAdapterVendaItem(obj as VendaItem, status);
  else if (obj instanceof DevolucaoItem) return new ComissaoAdapterDevolucaoItem(obj as DevolucaoItem, VendaStatus.DEVOLVIDA);
  else throw new Error("Valor não mapeado no ProviderComissaoAdapter. Objeto: " + JSON.stringify(obj));
}

export class ComissaoGrupoHandler extends ComissaoHandlerBase {
  protected ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (isValid(item.getProduto().id_grupo)) {
      let grupo = item.getProduto().id_grupo;

      if (!grupo.gera_comissao) {
        valorComissao.comissao_indice = ComissaoTipo.GRUPO_SEM_COMISSAO;
        valorComissao.comissao_valor = 0.0;
      } else if (grupo.comissao_vendedor > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.GRUPO_COM_RESTRICAO;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(grupo.comissao_vendedor, 100).toDecimalPlaces(2).toNumber(), item.getValorLiquido()]);
        valorComissao.comissao_percentual = grupo.comissao_vendedor;
      } else processou = false;
    } else processou = false;
    return processou;
  }
}

export class ComissaoVendedorHandler extends ComissaoHandlerBase {
  protected ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (isValid(item.getVendedor()) && isValid(item.getFormaPagamento())) {
      let forma = item.getFormaPagamento();
      let vendedor = item.getVendedor();

      if (forma.condicao.trim() === "APRAZO" && vendedor.comissao_aprazo > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.VENDEDOR_COMISSAO_APRAZO;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_aprazo, 100).toDecimalPlaces(2).toNumber(), item.getValorLiquido()]);
        valorComissao.comissao_percentual = vendedor.comissao_aprazo;
      } else if (forma.condicao.trim() === "AVISTA" && vendedor.comissao_avista > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.VENDEDOR_COMISSAO_AVISTA;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_avista, 100).toDecimalPlaces(2).toNumber(), item.getValorLiquido()]);
        valorComissao.comissao_percentual = vendedor.comissao_avista;
      } else processou = false;
    } else processou = false;

    return processou;
  }
}

export class ComissaoDefaultHandler extends ComissaoHandlerBase {
  protected ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean {
    valorComissao.comissao_indice = ComissaoTipo.SEM_COMISSAO;
    valorComissao.comissao_valor = 0.0;

    return true;
  }
}

export function getComissaoHandlerOrder(): ComissaoHandlerInterface {
  const a = new ComissaoProdutoHandler();
  const b = new ComissaoGrupoHandler();
  const c = new ComissaoVendedorHandler();
  const d = new ComissaoDefaultHandler();

  return a.setNextHandler(b.setNextHandler(c.setNextHandler(d)));
}
