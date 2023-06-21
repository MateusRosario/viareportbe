import { FormaPagamento } from './../../model/entity/FormaPagamento';
import { Any } from 'typeorm';
import { Vendedor } from './../../model/entity/Vendedor';
import { Produto } from './../../model/entity/Produto';
import { VendaItem } from "../../model/entity/VendaItem";
import { isValid } from "../../service/FunctionsServices";
import { ComissaoTipo, VendaStatus, VendaItemComissao } from "./VendaItemComissao";


export interface IComissaoAdapter {
  
  getId(): number;
  getIdItem(): number;
  getProduto(): Produto;
  getVendedor(): Vendedor;
  getValorBruto(): number;
  getValorDesconto(): number;
  getValorLiquido(): number;
  getData(): Date;
  getStatus(): VendaStatus;
  getFormaPagamento(): FormaPagamento;
  
}  

export interface ComissaoHandlerInterface {
  calcularComissao(item: IComissaoAdapter, valorComissao: VendaItemComissao);
  setNextHandler(handler: ComissaoHandlerInterface): ComissaoHandlerInterface;
}

export abstract class ComissaoHandlerBase implements ComissaoHandlerInterface {
  handler: ComissaoHandlerInterface;

  setNextHandler(handler: ComissaoHandlerInterface): ComissaoHandlerInterface {
    this.handler = handler;
    return this;
  }

  calcularComissao(item: IComissaoAdapter, valorComissao: VendaItemComissao) {
    if (!isValid(valorComissao.id)) {
      valorComissao.id = item.getIdItem();
      valorComissao.data_saida = item.getData();
      valorComissao.id_venda = item.getId();
      valorComissao.id_produto = item.getProduto().id;
      valorComissao.nome_produto = item.getProduto().nome;
      valorComissao.vl_total = item.getValorLiquido();
      valorComissao.comissao_percentual = 0.0;
      valorComissao.id_vendedor = item.getVendedor().id;
      valorComissao.nome_vendedor = item.getVendedor().nome;
      valorComissao.status = item.getStatus();
    }

    if (!this.ifHandler(item, valorComissao) && this.handler !== null) {
      this.handler.calcularComissao(item, valorComissao);
    }
  }

  protected abstract ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean;
}



