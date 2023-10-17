import { DataSource } from "typeorm";
import { getConnection } from "../../data-source";

const locale = Intl.DateTimeFormat().resolvedOptions();

export class VendedorService {
    getVendasPorVendedor(cnpj, data: { inicio: string, fim: string }): Promise<any> {
        const con: DataSource = getConnection(cnpj as string);
        return new Promise((res, rej) => {
            con.query<{ id: number, nome: string, bruto: number, desconto: number, item_cancelado: number, liquido: number }[]>(`
            SELECT COALESCE (vend.ID,0) AS ID,TRIM (COALESCE (vend.nome,'SEM VENDEDOR')) AS nome,SUM (vi.vl_total+vi.vl_desconto) :: FLOAT AS bruto,SUM (vi.vl_desconto) :: FLOAT AS desconto,SUM (CASE WHEN vi.cancelada='SIM' AND v.cancelada='NAO' THEN vi.vl_total ELSE 0.00 END) :: FLOAT AS item_cancelado, SUM(vi.vl_total)::FLOAT as liquido FROM venda AS v INNER JOIN venda_item AS vi ON (NOT v.nf_uniao AND v.ID=vi.id_venda) LEFT JOIN vendedor AS vend ON (v.id_vendedor=vend.ID) WHERE v.data_saida BETWEEN $1 AND $2 AND v.gerado='SIM' GROUP BY vend.ID,vend.nome ORDER BY SUM (CASE WHEN v.cancelada='NAO' AND vi.cancelada='NAO' THEN vi.vl_total ELSE 0.00 END) DESC;
            `, [data.inicio, data.fim]).then(async (response) => {
                if (response && response.length > 0) {

                    const invalidNumber = (value: any): number => {
                        return isNaN(value) || value == null || value === undefined ? 0 : value;
                    }


                    for (let i of response) {
                        const devolucao = await con.query<{ bruto: number, desconto: number, liquido: number }[]>(`SELECT SUM (vl_bruto) :: FLOAT AS bruto,SUM (vl_desconto) :: FLOAT AS desconto,SUM (vl_total) :: FLOAT AS liquido FROM devolucao_venda_viewm WHERE DATA BETWEEN $1 AND $2 AND gerado='SIM' AND id_vendedor= $3`, [data.inicio, data.fim, i.id]);
                        i['vendaDevolvida'] = invalidNumber(devolucao[0].bruto);
                        i['vendaDescontoDevolucao'] = invalidNumber(devolucao[0].desconto);


                        const cancelada = await con.query<{ bruto_produto: number, bruto_servico: number, desconto: number, liquido: number }[]>(`SELECT SUM (vl_produto) :: FLOAT AS bruto_produto, SUM (vl_servico) :: FLOAT AS bruto_servico, SUM (vl_desconto) :: FLOAT AS desconto,SUM (vl_total) :: FLOAT AS liquido FROM venda_cancelada_viewm WHERE data_cancelamento :: DATE BETWEEN $1 AND $2 AND id_vendedor= $3`, [data.inicio, data.fim, i.id])

                        i['vendaCancelada'] = invalidNumber(cancelada[0].bruto_produto + cancelada[0].bruto_servico);
                        i['vendaDescontoCancelamento'] = invalidNumber(cancelada[0].desconto);

                        const formas = await con.query<{ id: number, nome: string, cancelado: number, total: number }[]>(`SELECT fp.ID,TRIM (fp.nome) AS nome,SUM (CASE WHEN tb_canceladas.ID IS NOT NULL THEN vd.vl_total ELSE 0.00 END) :: FLOAT AS cancelado,SUM (CASE WHEN tb_canceladas.ID IS NULL THEN vd.vl_total ELSE 0.00 END) :: FLOAT AS total FROM venda AS v INNER JOIN venda_duplicata AS vd ON (NOT v.nf_uniao AND v.ID=vd.id_venda) INNER JOIN formas_pagamento AS fp ON (vd.id_forma=fp.ID) LEFT JOIN (
                            SELECT ID FROM venda_cancelada_viewm WHERE data_cancelamento :: DATE BETWEEN $1 AND $2 AND id_vendedor= $3) AS tb_canceladas ON (v.ID=tb_canceladas.ID) WHERE v.data_saida BETWEEN $1 AND $2 AND v.gerado='SIM' AND v.id_vendedor= $3 GROUP BY fp.ID,fp.nome,id_vendedor ORDER BY SUM (vd.vl_total) DESC`, [data.inicio, data.fim, i.id])

                        i['formas'] = formas && formas.length > 0 ? formas : [];

                        const grupos = await con.query<{ id: number, nome: string, cancelado: number, total: number }[]>(`SELECT COALESCE (gp.ID,0) AS ID,COALESCE (gp.nome,'SEM GRUPO') AS nome,SUM (CASE WHEN tb_canceladas.ID IS NOT NULL THEN vi.vl_total ELSE 0.00 END) :: FLOAT AS cancelado,SUM (CASE WHEN tb_canceladas.ID IS NULL THEN vi.vl_total ELSE 0.00 END) :: FLOAT AS total FROM venda AS v INNER JOIN venda_item AS vi ON (NOT v.nf_uniao AND v.ID=vi.id_venda) INNER JOIN produtos AS P ON (vi.id_produto=P.ID) LEFT JOIN grupo_produto AS gp ON (P.id_grupo=gp.ID) LEFT JOIN (
                            SELECT ID FROM venda_cancelada_viewm WHERE data_cancelamento :: DATE BETWEEN $1 AND $2 AND id_vendedor= $3) AS tb_canceladas ON (v.ID=tb_canceladas.ID) WHERE v.data_saida BETWEEN $1 AND $2 AND v.gerado='SIM' AND v.cancelada='NAO' AND vi.cancelada='NAO' AND v.id_vendedor= $3 GROUP BY gp.ID,gp.nome ORDER BY SUM (vi.vl_total) DESC`, [data.inicio, data.fim, i.id]);

                        i['grupo_produto'] = grupos && grupos.length > 0 ? grupos : [];


                        i['liquido'] = i['liquido'] - cancelada[0].liquido - devolucao[0].liquido;
                        i['itemCancelado'] = i.item_cancelado;
                    }

                    // console.log(response[0]);


                    res(response)
                } else {
                    rej(new Error('Nada Encontrado nessa data!'))
                }
            })
        })



    }
}