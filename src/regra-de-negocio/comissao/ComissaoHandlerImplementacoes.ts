import { VendaItem } from './../../model/entity/VendaItem';
import { DevolucaoItem } from "./../../model/entity/devolucao-item";
import Decimal from "decimal.js";
import { multiplicarVT } from "../../helpers/ArithmeticOperators";
import { FormaPagamento } from "../../model/entity/FormaPagamento";
import { Produto } from "../../model/entity/Produto";
import { Vendedor } from "../../model/entity/Vendedor";
import { isValid } from "../../services/FunctionsServices";
import { IComissaoAdapter, ComissaoHandlerBase, ComissaoHandlerInterface } from "./ComissaoHandler";
import { ComissaoTipo, VendaItemComissao, VendaStatus } from "./VendaItemComissao";
import { Venda } from "../../model/entity/Venda";
import { Between, DataSource, Like, Repository } from 'typeorm';
import { Empresas } from '../../model/entity/empresas';
import { DevolucaoVendaViewm } from '../../model/entity/devolucao-venda-viewm';

class ComissaoAdapterVendaItem implements IComissaoAdapter {
  private fator: number = 1;

  constructor(private vendaItem: VendaItem, private vendaStatus: VendaStatus) {
    if (!vendaItem) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não instanciado.");
    if ((vendaItem.id ? vendaItem.id : 0) === 0) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem vazio.");
    if (!vendaItem.id_produto) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não possui um produto.") + ` VendaItem (${vendaItem.id})`;
    if (!vendaItem.id_venda) throw new TypeError("ComissaoAdapterVendaItem: Objeto VendaItem não pertence a uma venda." + ` VendaItem (${vendaItem.id})`);
    if (!vendaItem.id_venda.id_vendedor) throw new TypeError("ComissaoAdapterVendaItem: A Venda do Objeto VendaItem não possui um vendedor." + ` Venda (${vendaItem.id_venda.id})`);
    if (!vendaItem.id_venda.id_forma) throw new TypeError("ComissaoAdapterVendaItem: A Venda do Objeto VendaItem não possui uma forma de pagamento." + ` Venda (${vendaItem.id_venda.id})`);

    this.fator = this.vendaStatus === VendaStatus.CANCELADA || this.vendaStatus === VendaStatus.CANCELADA_FP ? -1 : 1;
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

  constructor(private devolucaoItem: DevolucaoItem, private vendaStatus: VendaStatus) {
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
    return this.devolucaoItem.id_devolucao.id_pedido.data_saida as Date;
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
  else if (obj instanceof DevolucaoItem) return new ComissaoAdapterDevolucaoItem(obj as DevolucaoItem, status);
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
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(grupo.comissao_vendedor, 100).toNumber(), item.getValorLiquido()], 4);
        // valorComissao.comissao_valor = new Decimal(valorComissao.comissao_valor).toDecimalPlaces(2).toNumber();
        valorComissao.comissao_percentual = grupo.comissao_vendedor;
      } else processou = false;
    } else processou = false;
    return processou;
  }
}

export class ComissaoProdutoHandler extends ComissaoHandlerBase {
  protected ifHandler(item: IComissaoAdapter, valorComissao: VendaItemComissao): boolean {
    let processou = true;

    if (!item.getProduto().gera_comissao) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_SEM_COMISSAO;
      valorComissao.comissao_valor = 0.0;
    } else if (item.getProduto().comissao > 0.0) {
      valorComissao.comissao_indice = ComissaoTipo.PRODUTO_COM_RESTRICAO;
      valorComissao.comissao_valor = multiplicarVT([Decimal.div(item.getProduto().comissao, 100).toNumber(), item.getValorLiquido()], 4);
      // valorComissao.comissao_valor = new Decimal(valorComissao.comissao_valor).toDecimalPlaces(2).toNumber();
      valorComissao.comissao_percentual = item.getProduto().comissao;
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
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_aprazo, 100).toNumber(), item.getValorLiquido()], 4);
        // valorComissao.comissao_valor = new Decimal(valorComissao.comissao_valor).toDecimalPlaces(2).toNumber();
        valorComissao.comissao_percentual = vendedor.comissao_aprazo;
      } else if (forma.condicao.trim() === "AVISTA" && vendedor.comissao_avista > 0.0) {
        valorComissao.comissao_indice = ComissaoTipo.VENDEDOR_COMISSAO_AVISTA;
        valorComissao.comissao_valor = multiplicarVT([Decimal.div(vendedor.comissao_avista, 100).toNumber(), item.getValorLiquido()], 4);
        // valorComissao.comissao_valor = new Decimal(valorComissao.comissao_valor).toDecimalPlaces(2).toNumber();
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
      venda: connection.getRepository(Venda),
    }

    const where = { nf_uniao: false, gerado: Like('SIM') };
    where[`${fieldData}`] = Between(data.inicio.toISOString().split('T')[0], data.fim.toISOString().split('T')[0]);

    if (idVendedor) {
      where['id_vendedor'] = { id: idVendedor };
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


      repository.venda.find({ where: where, loadEagerRelations: false, relations: ['itens', 'itens.id_vendedor', 'itens.id_produto', 'id_cliente', 'id_vendedor', 'id_forma'], order: { id_vendedor: { id: 'ASC' } } }).then(async vds => {
        
        let retorno: vendaMiniModel[] = [];
        let sum = new Map<number, { total: number, comissao: number, desconto: number }>();
        //let devs = await this.BuscarDevolucoes(connection, data, idVendedor, idVenda, idCliente, idProduto);

        
        
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

            if (!sum.has(item.id_vendedor)) {
              sum.set(item.id_vendedor, { total: 0, comissao: 0, desconto: 0 })
            }

            let aux = sum.get(item.id_vendedor);
            aux.comissao = Decimal.add(aux.comissao, item.comissao_valor).toNumber();
            aux.total = Decimal.add(aux.total, i.vl_total).toNumber();
            aux.desconto = Decimal.add(aux.desconto, i.vl_desconto).toNumber();

            if (miniVenda.vendedor.has(item.id_vendedor)) {
              miniVenda.vendedor.get(item.id_vendedor).push(item);
            } else {
              miniVenda.vendedor.set(item.id_vendedor, [item]);
            }
          }
          miniVenda.vendedor = Array.from(miniVenda.vendedor.entries())
          retorno.push(miniVenda);
        }
        resolve({ itens: retorno, sum: Array.from(sum.entries()) });
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

      ret.comissao_percentual = i && i.comissao ? i.comissao : 0;
      ret.comissao_valor = multiplicarVT([Decimal.div(ret.comissao_percentual, 100).toNumber(), adapter.getValorLiquido()]);
      ret.comissao_valor = new Decimal(ret.comissao_valor).toDecimalPlaces(2).toNumber();
      resolve(ret);
    })
  }

  private BuscarDevolucoes(connection: DataSource, data: { inicio: Date, fim: Date }, idVendedor?: number, idVenda?: number, idCliente?: number, idProduto?: number) {
    const repository = connection.getRepository(DevolucaoVendaViewm);
    const where = {};
    where[`data`] = Between(data.inicio.toISOString().split('T')[0], data.fim.toISOString().split('T')[0]);

    if (idVendedor) {
      where['id_vendedor'] = idVendedor;
    }
    if (idVenda) {
      where['id'] = idVenda;
    }
    if (idCliente) {
      where['id_cliente'] = idCliente;
    }

    return new Promise((resolve, reject) => {
      repository.find({ where: where, relations: ['itens', 'id_vendedor', 'itens.id_produto'], loadEagerRelations: false })
        .then(async devolucoes => {
          let retorno = [];
          for (let dv of devolucoes) {
            for (let i of dv.itens) {
              let comicao = await this.CalcularComissaoDevolucao(connection, i, { id: dv.id_vendedor.id, nome: dv.id_vendedor.nome });
              comicao['id_venda'] = dv.id;

              retorno.push(comicao)
            }
          }
          resolve(retorno);
        })
    })
  }

  private CalcularComissaoDevolucao(connection: DataSource, item: DevolucaoItem, vendedor: { id: number, nome: string }) {
    const repository = {
      vendaItem: connection.getRepository(VendaItem),
    }
    return new Promise(async (resolve, reject) => {
      let inter = undefined;
      let ret = new VendaItemComissao();

      if (ComissaoDecrescente.INTERVALO) {
        inter = ComissaoDecrescente.INTERVALO;
      } else {
        inter = await connection.query<intervalo[]>(ComissaoDecrescente.INTERVALO_SQL);
        ComissaoDecrescente.INTERVALO = inter;
      }

      let vendaItem = await repository.vendaItem.createQueryBuilder('vi')
        .innerJoin(DevolucaoVendaViewm, 'd', 'vi.id_venda.id = d.id_venda')
        .innerJoin(DevolucaoItem, 'di', 'd.id = di.id_devolucao')
        .where('di.id = :id', { id: item.id }).getMany();
      let aux = {
        somaTotal: 0,
        descontoTotal: 0,
        quantidade: 0,
        vl_unitario: 0
      };

      for (let vi of vendaItem) {
        if (aux.vl_unitario === 0) aux.vl_unitario = vi.vl_unitario;

        aux.quantidade += vi.quantidade;
        aux.somaTotal += vi.vl_total;
        aux.descontoTotal += vi.vl_desconto;
      }
      //calcula o desconto médio para caso de o item não ser agrupado ou haver devolução parcial
      // console.log(aux, item.quantidade);
      const descontoMedio = aux.quantidade > 0 ? Decimal.div(aux.descontoTotal, aux.quantidade).toNumber() : 0;
      let vlCalculado = Decimal.mul(item.quantidade, aux.vl_unitario);
      const pDesconto = Decimal.div(Decimal.mul(Decimal.mul(descontoMedio, aux.quantidade), 100), vlCalculado).toNumber();


      const i: intervalo = inter.find((cm: intervalo) => cm.intervalo_1 <= pDesconto && cm.intervalo_2 >= pDesconto);
      const comissao = Decimal.mul(vlCalculado, Decimal.div((i && i.comissao ? i.comissao : 0), 100));

      ret.id = item.id;
      ret.id_vendedor = vendedor.id;
      ret.nome_vendedor = vendedor.nome.trim();
      ret.comissao_indice = item.id_produto.gera_comissao ? ComissaoTipo.COMISSAO_DESCRESCENTE : ComissaoTipo.PRODUTO_COM_RESTRICAO;
      ret.id_produto = item.id_produto.id;
      ret.nome_produto = item.id_produto.nome;
      ret.vl_total = vlCalculado.toNumber();

      if (!item.id_produto.gera_comissao) {
        ret.comissao_percentual = 0.00;
        ret.comissao_valor = 0.00;
        resolve(ret);
        return;
      }
      ret.comissao_percentual = i && i.comissao ? i.comissao : 0;
      ret.comissao_valor = comissao.equals(0) ? 0 : comissao.neg().toNumber();

      resolve(ret);
    })
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
