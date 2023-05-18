export enum ComissaoTipo {
    PRODUTO_SEM_COMISSAO = "PRODUTO SEM COMISSÃO",
    PRODUTO_COM_RESTRICAO = "PRODUTO COM RESTRIÇÃO",
    GRUPO_SEM_COMISSAO = "GRUPO SEM COMISSÃO",
    GRUPO_COM_RESTRICAO = "GRUPO COM RESTRIÇÃO",
    VENDEDOR_COMISSAO_APRAZO = "VENDEDOR COMISSÃO A PRAZO",
    VENDEDOR_COMISSAO_AVISTA = "VENDEDOR COMISSÃO A VISTA",
    SEM_COMISSAO = "NÃO TEM COMISSÃO"
}


export class VendaItemComissao {
    id: number;
    id_venda: number;
    id_produto: number;
    nome_produto: string;
    id_vendedor: number;
    nome_vendedor: string;
    vl_total: number;
    comissao_indice: ComissaoTipo;
    comissao_percentual: number;
    comissao_valor: number;
  
  }