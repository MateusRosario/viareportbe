import { Cliente } from './../../model/entity/Cliente';
import { VendaItem } from './../../model/entity/VendaItem';
import { DevolucaoItem } from "./../../model/entity/devolucao-item";
import Decimal from "decimal.js";
import { multiplicarVT } from "../../Helpers/ArithmeticOperators";
import { FormaPagamento, FormaPagamentoCondicaoEnum } from "../../model/entity/FormaPagamento";
import { Produto } from "../../model/entity/Produto";
import { Vendedor } from "../../model/entity/Vendedor";
import { isValid } from "../../service/FunctionsServices";
import { IComissaoAdapter, ComissaoHandlerBase, ComissaoHandlerInterface } from "./ComissaoHandler";
import { ComissaoTipo, VendaItemComissao, VendaStatus } from "./VendaItemComissao";
import { Venda } from "../../model/entity/Venda";
import { Between, DataSource, Repository } from 'typeorm';
import { Empresas } from '../../model/entity/empresas';

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
    if ((vendaItem.id ? vendaItem.id : 0) === 0) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem vazio.");
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
    if ((devolucaoItem.id ? devolucaoItem.id : 0) === 0) throw new TypeError("ComissaoAdapterDevolucaoItem: Objeto DevolucaoItem vazio.");
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

export class ComissaoDecrescente {
  static INTERVALO_SQL = `SELECT UNNEST (ARRAY [ intervalo_a1 :: FLOAT, intervalo_b1 :: FLOAT,intervalo_c1 :: FLOAT,intervalo_d1 :: FLOAT,intervalo_e1 :: FLOAT,intervalo_f1 :: FLOAT,intervalo_g1 :: FLOAT,intervalo_h1 :: FLOAT,intervalo_i1 :: FLOAT,intervalo_j1 :: FLOAT,intervalo_l1 :: FLOAT,intervalo_m1 ]) AS intervalo_1,UNNEST (ARRAY [ intervalo_a2 :: FLOAT,intervalo_b2 :: FLOAT,intervalo_c2 :: FLOAT,intervalo_d2 :: FLOAT,intervalo_e2 :: FLOAT,intervalo_f2 :: FLOAT,intervalo_g2 :: FLOAT,intervalo_h2 :: FLOAT,intervalo_i2 :: FLOAT,intervalo_j2 :: FLOAT,intervalo_l2 :: FLOAT,intervalo_m2 ]) AS intervalo_2,UNNEST (ARRAY [ comissao_a :: FLOAT,comissao_b :: FLOAT,comissao_c :: FLOAT,comissao_d :: FLOAT,comissao_e :: FLOAT,comissao_f :: FLOAT,comissao_g :: FLOAT,comissao_h :: FLOAT,comissao_i :: FLOAT,comissao_j :: FLOAT,comissao_l :: FLOAT,comissao_m :: FLOAT ]) AS comissao FROM empresas;`;
  static INTERVALO: intervalo[] = undefined;

  constructor() {
    ComissaoDecrescente.INTERVALO = undefined;
  }

  public BuscarEcalcular(connection: DataSource, data: { inicio: Date, fim: Date }, fieldData: string, idVendedor?: number, idVenda?: number, idCliente?: number, idProduto?: number) {
    const repository = {
      empresa: connection.getRepository(Empresas),
      vendaItem: connection.getRepository(VendaItem),
      venda: connection.getRepository(Venda)
    }

    const where = { nf_uniao: false, gerado: 'SIM' };
    where[`${fieldData}`] = Between(data.inicio, data.fim);

    if (idVendedor) {
      where['id_vendedor'] = idVendedor;
    }
    if (idVenda) {
      where['id'] = idVenda;
    }
    if (idCliente) {
      where['id_cliente'] = idCliente;
    }
    if (idProduto) {
      where['itens'] = {
        id_produto: {
          id: idProduto
        }
      };
    }
    
    return new Promise(async (resolve, reject) => {
      repository.venda.find({ where: where, loadEagerRelations: false, relations: ['itens', 'itens.id_vendedor', 'itens.id_produto', 'id_cliente', 'id_vendedor', 'id_forma'] }).then(async vds => {
        let retorno: vendaMiniModel[] = [];
        for (let v of vds) {
          let miniVenda = {} as vendaMiniModel;

          miniVenda.id = v.id;
          miniVenda.data_emissao = v.data_emissao;
          miniVenda.data_saida = v.data_saida;
          miniVenda.vl_total = v.vl_total;
          miniVenda.vl_produto = v.vl_produto;
          miniVenda.vl_desconto = v.vl_desconto;
          miniVenda.cliente = {
            nome: v.id_cliente.nome,
            id: v.id_cliente.id
          }
          miniVenda.gerado = v.gerado;
          miniVenda.vendedor = new Map<number, VendaItemComissao[]>();
          for (let i of v.itens) {
            i.id_venda = v;
            let item = await this.calcular(i, connection);
            
            if(miniVenda.vendedor.has(item.id_vendedor)){
              miniVenda.vendedor.get(item.id_vendedor).push(item);
            }else{
              miniVenda.vendedor.set(item.id_vendedor, [item]);
            }
          }
          miniVenda.vendedor = Array.from(miniVenda.vendedor.entries())         
          retorno.push(miniVenda);
        }
        
              
        resolve(retorno);
      }).catch(err => reject(err));
    })
  }

  public calcular(item: VendaItem, connection: DataSource) {
    return new Promise<VendaItemComissao>(async (resolve, reject) => {
      let adapter = ComissaoAdapterProvider(item, VendaStatus.NORMAL);
      if (!isValid(adapter.getFormaPagamento()) || !isValid(adapter.getProduto())) {
        reject(new Error('Produto ou forma de pagamento inexistente!'))
      }
      let inter = undefined;

      if (ComissaoDecrescente.INTERVALO) {
        inter = ComissaoDecrescente.INTERVALO;
      } else {
        inter = await connection.query<intervalo[]>(ComissaoDecrescente.INTERVALO_SQL);
        ComissaoDecrescente.INTERVALO = inter;
      }

      const prod = adapter.getProduto();

      let ret = new VendaItemComissao();

      ret.id_venda = item.id_venda.id;
      ret.cliente = { id: item.id_venda.id_cliente.id, nome: item.id_venda.id_cliente.nome }
      ret.id = item.id;
      ret.id_vendedor = item.id_vendedor ? item.id_vendedor.id : item.id_venda.id_vendedor.id;
      ret.nome_vendedor = item.id_vendedor ? item.id_vendedor.nome.trim() : item.id_venda.id_vendedor.nome.trim();
      ret.comissao_indice = prod.gera_comissao ? ComissaoTipo.COMISSAO_DESCRESCENTE : ComissaoTipo.PRODUTO_COM_RESTRICAO;
      ret.id_produto = prod.id;
      ret.nome_produto = prod.nome;
      ret.vl_total = adapter.getValorLiquido();
      if (!prod.gera_comissao) {
        ret.comissao_percentual = 0.00;
        ret.comissao_valor = 0.00;
        resolve(ret);
        return;
      }
      const pDesconto = Decimal.div(Decimal.mul(item.vl_desconto, 100), adapter.getValorLiquido()).toNumber();
      const i: intervalo = inter.find((cm: intervalo) => cm.intervalo_1 <= pDesconto && cm.intervalo_2 >= pDesconto);

      ret.comissao_percentual = i.comissao;
      ret.comissao_valor = multiplicarVT([Decimal.div(i.comissao, 100).toDecimalPlaces(2).toNumber(), adapter.getValorLiquido()]);

      resolve(ret);
    })
  }

  public createVendaBasica(venda: Venda) {
    const ret = new Venda();
    ret.id = venda.id;
    ret.data_saida = venda.data_saida;
    ret.data_cancelamento = venda.data_cancelamento;
    ret.data_emissao = venda.data_emissao;
    ret.vl_desconto = venda.vl_desconto;
    ret.vl_produto = venda.vl_produto;
    ret.vl_total = venda.vl_total;
    ret.id_cliente = new Cliente();
    ret.id_cliente.id = venda.id_cliente.id;
    ret.id_cliente.nome = venda.id_cliente.nome;

    return ret;
  }
}

export interface intervalo {
  intervalo_1: number;
  intervalo_2: number;
  comissao: number;
}

export interface vendaMiniModel {
  id: number
  cliente: { nome: string, id: number }
  data_saida: Date;
  data_emissao: Date;
  data_cancelamento: Date;
  gerado: string;
  vl_total: number;
  vl_desconto: number;
  vl_produto: number;
  vendedor: Map<number, VendaItemComissao[]> | any
}
