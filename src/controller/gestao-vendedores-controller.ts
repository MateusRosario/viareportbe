import { Response, Router } from "express";
import { getConnection } from "../data-source";
import { EstatisticaVendaSQLBuilder, GroupByVendedorValues } from "../service/EstatisticaVendaSQLBuilder";
import { TypedRequestBody } from "./common/ControllerBase";
import { VendedorService } from "./service/VendedorService";


export class GestaoVendedoresController {
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
      const exe1 = getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.devolucao_venda_viewm;");
      const exe2 = getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_cancelada_viewm;");
      const exe3 = getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_duplicata_credito_viewm;");

      let repositoty = getConnection(req.headers["cnpj"] as string).getRepository<GroupByVendedorValues>(GroupByVendedorValues);

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

export const gestaoVendedoresRouter = Router();

const controller = new GestaoVendedoresController();

gestaoVendedoresRouter.get("/vendas-group-by-vendedor", controller.getRowsGroupByVendedor);
gestaoVendedoresRouter.get("/comissao_view", (req, res) => {
  res.render("Comissao", { cnpj: req.headers["cnpj"] });
});

const locale = Intl.DateTimeFormat().resolvedOptions();


gestaoVendedoresRouter.get("/dashbaord", async (req, res) => {

  Promise.all([getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.devolucao_venda_viewm;")
    , getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_cancelada_viewm;")
    , getConnection(req.headers["cnpj"] as string).query("REFRESH MATERIALIZED VIEW  public.venda_duplicata_credito_viewm;")]);

  let data: {
    inicio: string,
    fim: string
  } = {
    inicio: undefined,
    fim: undefined
  };

  if (req.query["dataInicio"] === undefined || req.query["dataFim"] === undefined) {
    res.status(400).send('Data não informada');
    throw new Error('Data não informada')
  }


  data.inicio = req.query["dataInicio"] as string;
  data.fim = req.query["dataFim"] as string;

  const r = await new VendedorService().getVendasPorVendedor(req.headers["cnpj"], data)
  const f = r[0]
  res.render('VendedorDashBoard', { values: r })
});


gestaoVendedoresRouter.get('', (req, res) => {
  res.render('GestaoVendedoresMain', { cnpj: req.headers["cnpj"] as string })
})

export default gestaoVendedoresRouter;
