import { DataSource } from "typeorm";
import { getConnection } from "../../data-source";

export class VendedorService {
    getVendasPorVendedor(cnpj, data: { inicio: Date, fim: Date }): Promise<any> {
        const con: DataSource = getConnection(cnpj as string);

        return new Promise((res, rej) => {
            con.query<{ id: number, nome: string, bruto: number, liquido: number, quantidade_itens: number }[]>(`
            WITH v AS (SELECT ID,id_vendedor,data_emissao, data_saida FROM venda WHERE gerado LIKE 'SIM')
            SELECT v.id_vendedor as id,trim(vendedor.nome) as nome,trunc(SUM (vi.vl_unitario*vi.quantidade),2)::float AS bruto,trunc(SUM (vi.vl_unitario*vi.quantidade-vi.vl_desconto),2)::float AS liquido,SUM (vi.vl_desconto)::float AS desconto,COUNT (vi.ID)::float quantidade_itens FROM v INNER JOIN venda_item vi ON (v.ID=vi.ID) INNER JOIN vendedor ON (v.id_vendedor=vendedor.ID) WHERE vi.cancelada LIKE 'NAO' AND vi.devolucao LIKE 'NAO' AND v.data_saida BETWEEN $1 AND $2 GROUP BY v.id_vendedor,vendedor.nome ORDER BY bruto DESC;
        `, [data.inicio, data.fim]).then(async (response: {
                id: number, nome: string, bruto: number, liquido: number, quantidade_itens: number,
            }[]) => {
                if (response && response.length > 0) {

                    const devolucao: {
                        id_vendedor: number, vl_devolucao: number, devolucao_desconto: number
                    }[] = await con.query<{ id_vendedor: number, vl_devolucao: number, devolucao_desconto: number }[]>(`SELECT id_vendedor, sum(vl_total)::float as vl_devolucao, sum(vl_desconto)::float as devolucao_desconto from devolucao_venda_viewm dv 
                                             where data BETWEEN $1 and $2 GROUP BY id_vendedor;`, [data.inicio, data.fim]);

                    const cancelamento: {
                        id_vendedor: number, vl_cancelado: number, cancelamento_desconto: number
                    }[] = await con.query<{ id_vendedor: number, vl_cancelado: number, cancelamento_desconto: number }[]>(`SELECT id_vendedor, sum(vl_total)::float as vl_cancelado, sum(vl_desconto)::float as cancelamento_desconto from venda_cancelada_viewm cv  where data_cancelamento BETWEEN $1 and $2 GROUP BY id_vendedor;`, [data.inicio, data.fim])

                    const forma: {
                        fp_nome: string, id_fp: number, id_vendedor: number, total: number, divida: number
                    }[] = await con.query<{ fp_nome: string, id_fp: number, id_vendedor: number, total: number, divida: number }[]>(`
                    WITH v AS (SELECT ID,id_vendedor,data_emissao,data_saida FROM venda WHERE gerado LIKE 'SIM' AND cancelada LIKE 'NAO' AND devolucao LIKE 'NAO')
                    SELECT fp.nome as fp_nome,fp.ID as id_fp,v.id_vendedor,SUM(vd.vl_total)::float AS total,SUM(vd.vl_divida)::float AS divida FROM venda_duplicata vd INNER JOIN formas_pagamento fp ON (vd.id_forma=fp.ID) INNER JOIN v ON (v.ID=vd.id_venda) WHERE vd.DATA BETWEEN $1 AND $2 GROUP BY fp.nome,fp.ID,v.id_vendedor ORDER BY v.id_vendedor;
                `, [data.inicio, data.fim]);

                    const grupo: {
                        id: number, nome: string, id_vendedor: number, bruto: number, liquido: number
                    }[] = await con.query<{ id: number, nome: string, id_vendedor: number, bruto: number, liquido: number }[]>(`
                WITH v AS (SELECT ID,id_vendedor,data_emissao,data_saida FROM venda WHERE gerado LIKE 'SIM' AND cancelada LIKE 'NAO' AND devolucao LIKE 'NAO')
    SELECT gp.ID,gp.nome,v.id_vendedor,trunc(SUM(vi.vl_unitario*vi.quantidade),2)::float AS bruto,trunc(SUM(vi.vl_unitario*vi.quantidade-vi.vl_desconto),2)::float AS liquido FROM venda_item vi INNER JOIN v ON (v.ID=vi.id_venda) INNER JOIN produtos P ON (vi.id_produto=P.ID AND P.ativo LIKE 'SIM') INNER JOIN grupo_produto gp ON (P.id_grupo=gp.ID) WHERE v.data_saida BETWEEN $1 AND $2 GROUP BY gp.ID,gp.nome,v.id_vendedor;
                `, [data.inicio, data.fim])
                    
                    for (let i of devolucao) {
                        for (let j of response) {
                            j['vendaDescontoDevolucao'] = 0;
                            j['vendaDevolvida'] = 0;
                            if (i.id_vendedor == j.id) {
                                j['vendaDescontoDevolucao'] = i.devolucao_desconto;
                                j['vendaDevolvida'] = i.vl_devolucao;
                                break;
                            }
                        }
                    }

                    for (let i of cancelamento) {
                        for (let j of response) {
                            j['vendaDescontoCancelamento'] = 0;
                            j['vendaCancelada'] = 0;
                            if (i.id_vendedor == j.id) {
                                console.log(i);                                
                                j['vendaDescontoCancelamento'] = i.cancelamento_desconto;
                                j['vendaCancelada'] = i.vl_cancelado;
                                break;
                            }
                        }
                    }

                    for (let i of response) {
                        i['formas'] = []
                        i['grupo_produto'] = []
                        for (let j of forma) {
                            if (i.id == j.id_vendedor) {
                                i['formas'].push({
                                    cancelado: 0,
                                    id: j.id_fp,
                                    idVendedor: j.id_vendedor,
                                    nome: j.fp_nome,
                                    total: j.total
                                })
                            }
                        }
                        for (let j of grupo) {
                            if (i.id == j.id_vendedor) {
                                i['grupo_produto'].push({
                                    cancelado: 0,
                                    id: j.id,
                                    nome: j.nome,
                                    total: j.liquido,
                                    bruto: j.bruto
                                })
                            }
                        }
                        i['itemCancelado'] = 0;
                    }


                    res(response)
                } else {
                    rej(new Error('Nada Encontrado nessa data!'))
                }
            })
        })



    }
}