import Decimal from "decimal.js";
import { multiplicarVT } from "../../Helpers/ArithmeticOperators";
import { VendaItem } from "../../model/entity/VendaItem";
import { isValid } from "../../service/FunctionsServices";
import { ComissaoHandlerBase, ComissaoHandlerInterface } from "./ComissaoHandler";
import { ComissaoTipo, VendaItemComissao } from "./VendaItemComissao";

export class ComissaoProdutoHandler extends ComissaoHandlerBase {
  protected ifHandler(item: VendaItem, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (!item.id_produto.gera_comissao) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_SEM_COMISSAO;
      valorComissao.comissao_valor = 0.0;
    } else if (item.id_produto.comissao > 0.0) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_COM_RESTRICAO;
      valorComissao.comissao_valor = multiplicarVT([Decimal.div(item.id_produto.comissao, 100).toDecimalPlaces(2).toNumber(), item.vl_total]);
      valorComissao.comissao_percentual = item.id_produto.comissao;
    } else processou = false;

    return processou;
  }
}

export class ComissaoGrupoHandler extends ComissaoHandlerBase {
  protected ifHandler(item: VendaItem, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (isValid(item.id_produto.id_grupo)) {
      let grupo = item.id_produto.id_grupo;

      if (!grupo.gera_comissao) {
        valorComissao.comissao_indice = ComissaoTipo.GRUPO_SEM_COMISSAO;
        valorComissao.comissao_valor = 0.0;
      } else if (grupo.comissao_vendedor > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.GRUPO_COM_RESTRICAO;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(grupo.comissao_vendedor, 100).toDecimalPlaces(2).toNumber(), item.vl_total]);
        valorComissao.comissao_percentual = grupo.comissao_vendedor;
      } else processou = false;
    } else processou = false;
    return processou;
  }
}

export class ComissaoVendedorHandler extends ComissaoHandlerBase {
  protected ifHandler(item: VendaItem, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (isValid(item.id_venda.id_vendedor) && isValid(item.id_venda.id_forma)) {
      let forma = item.id_venda.id_forma;
      let vendedor = item.id_venda.id_vendedor;

      if (forma.condicao.trim() === "APRAZO" && vendedor.comissao_aprazo > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.VENDEDOR_COMISSAO_APRAZO;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_aprazo, 100).toDecimalPlaces(2).toNumber(), item.vl_total]);
        valorComissao.comissao_percentual = vendedor.comissao_aprazo;
      } else if (forma.condicao.trim() === "AVISTA" && vendedor.comissao_avista > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.VENDEDOR_COMISSAO_APRAZO;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_avista, 100).toDecimalPlaces(2).toNumber(), item.vl_total]);
        valorComissao.comissao_percentual = vendedor.comissao_avista;
      } else processou = false;
    } else processou = false;

    return processou;
  }
}

export class ComissaoDefaultHandler extends ComissaoHandlerBase {

  protected ifHandler(item: VendaItem, valorComissao: VendaItemComissao): boolean {
    
    valorComissao.comissao_indice = ComissaoTipo.SEM_COMISSAO;
    valorComissao.comissao_valor = 0.00;
    
    return true;
  }
  
}


export function getComissaoHandlerOrder(): ComissaoHandlerInterface {
  const a = new ComissaoProdutoHandler();
  const b = new ComissaoGrupoHandler();
  const c = new ComissaoVendedorHandler();
  const d =  new ComissaoDefaultHandler();
  
  return a.setNextHandler(b.setNextHandler(c.setNextHandler(d)));
}
