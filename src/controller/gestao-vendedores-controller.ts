import { Response, Router } from "express";
import { getDBConnection } from "../services/data-config-services/db-connection.service";
import { EstatisticaVendaSQLBuilder, GroupByVendedorValues } from "../services/EstatisticaVendaSQLBuilder";
import { TypedRequestBody } from "./common/ControllerBase";
import { VendedorService } from "./service/VendedorService";


export class GestaoVendedoresController {

  render(req, res) {
    res.render('GestaoVendedoresMain', { cnpj: req.headers["cnpj"] as string });
  }

  async renderVendedorDashBoardComponent(req, res) {

    if (req.query["dataInicio"] === undefined || req.query["dataFim"] === undefined) {
      res.status(400).send('Data não informada');
      throw new Error('Data não informada')
    }

    let data: {
      inicio: string,
      fim: string
    } = {
      inicio: req.query["dataInicio"],
      fim: req.query["dataFim"]
    };

    const vendasResult = await new VendedorService().getVendasPorVendedor(req.headers["cnpj"], data);
    res.render('VendedorDashBoard', { values: vendasResult });
  }

  async renderComissaoComponent(req, res) {
    res.render("Comissao", { cnpj: req.headers["cnpj"] });
  }

  // /vendas-group-by-vendedor?dataSaidaInicio=2023-04-01&dataSaidaFim=2023-04-30
  getRowsGroupByVendedor(req: TypedRequestBody<any>, res: Response<any, Record<string, any>>, next: any) {
    let aDataInicio: Date;
    let aDataFim: Date;
    try {
      if (req.query["dataSaidaInicio"] === undefined || req.query["dataSaidaFim"] === undefined) {
        throw new Error("Data não informada");
      }

      aDataInicio = new Date(req.query["dataSaidaInicio"] as string);
      aDataFim = new Date(req.query["dataSaidaFim"] as string);

      console.log("aDataInicio: ", aDataInicio, "  -- ", aDataInicio.toLocaleDateString());
      console.log("aDataFim: ", aDataFim, " -- ", aDataFim.toISOString());

      const builder = new EstatisticaVendaSQLBuilder();

      let query = builder.getGroupByVendedorSQL(aDataInicio, aDataFim, req.headers["cnpj"] as string);
      const exe1 = getDBConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.devolucao_venda_viewm;");
      const exe2 = getDBConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_cancelada_viewm;");
      const exe3 = getDBConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_duplicata_credito_viewm;");

      let repositoty = getDBConnection(req.headers["cnpj"] as string).getRepository<GroupByVendedorValues>(GroupByVendedorValues);

      Promise.all([exe1, exe2, exe3]);

      const query1 = repositoty.query(query).then((lista: GroupByVendedorValues[]) => {
        res.status(200).send(lista);
      });

      console.log("terminou tudo");
    } catch (error) {
      res.status(400).send("Não foi realizar o parse das datas informadas. Motivo: " + error["message"]);
    }
  }
}

const gestaoVendedoresController = new GestaoVendedoresController();

export const gestaoVendedoresRouter = Router();

//** data requests */
gestaoVendedoresRouter.get("/vendas-group-by-vendedor", gestaoVendedoresController.getRowsGroupByVendedor);

//** renders requests */
gestaoVendedoresRouter.get('', gestaoVendedoresController.render);
gestaoVendedoresRouter.get("/dashbaord", gestaoVendedoresController.renderVendedorDashBoardComponent);
gestaoVendedoresRouter.get("/comissao_view", gestaoVendedoresController.renderComissaoComponent);

export default gestaoVendedoresRouter;
