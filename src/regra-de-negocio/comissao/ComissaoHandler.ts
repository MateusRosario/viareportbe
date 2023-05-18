import { VendaItem } from "../../model/entity/VendaItem";
import { isValid } from "../../service/FunctionsServices";
import { ComissaoTipo, VendaItemComissao } from "./VendaItemComissao";

export interface ComissaoHandlerInterface {
  calcularComissao(item: VendaItem, valorComissao: VendaItemComissao);
  setNextHandler(handler: ComissaoHandlerInterface): ComissaoHandlerInterface;
}

export abstract class ComissaoHandlerBase implements ComissaoHandlerInterface {
  handler: ComissaoHandlerInterface;

  setNextHandler(handler: ComissaoHandlerInterface): ComissaoHandlerInterface{
    this.handler = handler;
    return this;
  }

  calcularComissao(item: VendaItem, valorComissao: VendaItemComissao) {
    if (!isValid(valorComissao.id)) {
      valorComissao.id = item.id;
      valorComissao.id_venda = item.id_venda.id;
      valorComissao.id_produto = item.id_produto.id;
      valorComissao.nome_produto = item.nome_produto;
      valorComissao.vl_total = item.vl_total;
      valorComissao.comissao_percentual = 0.00;
      valorComissao.id_vendedor = item.id_venda.id_vendedor.id;
      valorComissao.nome_vendedor = item.id_venda.id_vendedor.nome;
    }
 
    if (!this.ifHandler(item, valorComissao) && this.handler !== null) {
      this.handler.calcularComissao(item, valorComissao);
    }
  }

  protected abstract ifHandler(item: VendaItem, valorComissao: VendaItemComissao): boolean;
}
