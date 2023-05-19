import { VendaRepository } from "./../../repository/VendaRepository";
import { VendaItemRepository } from "./../../repository/VendaItemRepository";
import { Venda } from "./../../model/entity/Venda";
import { AppDataSource } from "./../../data-source";
import { httpException } from "./../../model/exceptions/httpExceptions";
import { Page } from "../../model/apoio/page";
import { VendaItem } from "../../model/entity/VendaItem";
import { getComissaoHandlerOrder } from "../../regra-de-negocio/comissao/ComissaoHandlerImplementacoes";
import { VendaItemComissao } from "../../regra-de-negocio/comissao/VendaItemComissao";
import { PageService } from "../../service/PageService";
import { BuidWhereByModel } from "../../repository/common/QueryUtils";

export class ComissaoWorker {
  async getComissaoPorItem(query: VendaItem, numberPage: number = 0, sizePage: number = 50): Promise<Page<VendaItemComissao>> {
    let service = new PageService<VendaItem>(new VendaItem());
    let itens = new Page<VendaItemComissao>();
    itens.content = [];

    const page = new Page<VendaItem>();
    page.size = sizePage;
    page.number = numberPage;
    page.sort = { fields: "id_venda.id", dir: "ASC" };

    const comissaoHandler = getComissaoHandlerOrder();
    console.log("Fez a requisição");

    let sql = VendaItemRepository.createQueryBuilder("vi")
      .innerJoinAndSelect("vi.id_venda", "v")
      .innerJoinAndSelect("vi.id_produto", "p")
      .innerJoinAndSelect("p.id_grupo", "gp")
      .innerJoinAndSelect("v.id_vendedor", "vend")
      .where(BuidWhereByModel(VendaItemRepository.create(query)))
      .orderBy("v.data_saida asc, v.id")
      .offset(page.getOffset())
      .limit(page.size);

    return sql.getManyAndCount().then((value) => {
      page.content = value[0];
      page.length = value[1];
      page.contentLength = page.content.length;
      page.content.forEach((item) => {
        const comissao = new VendaItemComissao();
        comissaoHandler.calcularComissao(item, comissao);

        itens.content.push(comissao);
      });

      itens.length = page.length;
      itens.number = page.number;
      itens.size = page.size;
      itens.sort = page.sort;
      itens.contentLength = page.contentLength;

      return itens;
    });

    // return service.findByExemple(query, page).then((_page) => {
    //   console.log("Terminou requisição");

    //   //   _page.content.forEach((item) => {
    //   //     const comissao = new VendaItemComissao();
    //   //     comissaoHandler.calcularComissao(item, comissao);

    //   //     itens.content.push(comissao);
    //   //   });

    //   itens.length = _page.length;
    //   itens.number = _page.number;
    //   itens.size = _page.size;
    //   itens.sort = _page.sort;
    //   return itens;
    // });
  }
}
