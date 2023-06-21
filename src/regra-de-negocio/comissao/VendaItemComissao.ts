import { RepositoryNotTreeError } from "typeorm";

export enum ComissaoTipo {
    PRODUTO_SEM_COMISSAO = "PRODUTO SEM COMISSÃO",
    PRODUTO_COM_RESTRICAO = "PRODUTO COM RESTRIÇÃO",
    GRUPO_SEM_COMISSAO = "GRUPO SEM COMISSÃO",
    GRUPO_COM_RESTRICAO = "GRUPO COM RESTRIÇÃO",
    VENDEDOR_COMISSAO_APRAZO = "COMISSÃO A PRAZO",
    VENDEDOR_COMISSAO_AVISTA = "COMISSÃO A VISTA",
    SEM_COMISSAO = "NÃO TEM COMISSÃO"
}

export enum VendaStatus {
        NORMAL = "NORMAL",
        CANCELADA = "CANCELADA",
        DEVOLVIDA = "DEVOLVIDA",
}


export class VendaItemComissao {
    id: number;
    id_venda: number;
    data_saida: Date;
    id_produto: number;
    nome_produto: string;
    id_vendedor: number;
    nome_vendedor: string;
    vl_total: number;
    comissao_indice: ComissaoTipo;
    comissao_percentual: number;
    comissao_valor: number;
    status: VendaStatus;


    toString(): string {
        let retorno = "";
        for (const prop in this){
            retorno = retorno + ';' + this[prop];
        }
        retorno = retorno.substring(1, retorno.length - 1);
        return retorno;
    }
  
  }
