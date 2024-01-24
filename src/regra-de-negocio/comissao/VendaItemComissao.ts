import { RepositoryNotTreeError } from "typeorm";

export enum ComissaoTipo {
    PRODUTO_SEM_COMISSAO = "PROD. S/ COMISSÃO",
    PRODUTO_COM_RESTRICAO = "PROD. C/ RESTRIÇÃO",
    GRUPO_SEM_COMISSAO = "GRUPO S/ COMISSÃO",
    GRUPO_COM_RESTRICAO = "GRUP. C/ RESTRIÇÃO",
    VENDEDOR_COMISSAO_APRAZO = "COMISSÃO A PRAZO",
    VENDEDOR_COMISSAO_AVISTA = "COMISSÃO A VISTA",
    SEM_COMISSAO = "SEM COMISSÃO",
    COMISSAO_DESCRESCENTE= "RESTRITO POR COMISSÃO DECRESCENTE"
}

export enum VendaStatus {
    NORMAL = "NORMAL",
    CANCELADA = "CANCELADA",
    DEVOLVIDA = "DEVOLVIDA",
    /** Venda Cancelada, que foi geranda antes do período consultado */
    CANCELADA_FP = "CANCELADA (F.P.)",
    /** Venda Devolvida, que foi geranda antes do período consultado */
    DEVOLVIDA_FP = "DEVOLVIDA (F.P.)"
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
    cliente: {
        id: number,
        nome: string
    }


    toString(): string {
        let retorno = "";
        for (const prop in this){
            retorno = retorno + ';' + this[prop];
        }
        retorno = retorno.substring(1, retorno.length - 1);
        return retorno;
    }
  
  }
