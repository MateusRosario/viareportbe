import { Response, Router } from "express";
import { AppDataSource } from "../data-source";
import { EstatisticaVendaSQLBuilder, GroupByVendedorValues } from "../service/EstatisticaVendaSQLBuilder";
import { TypedRequestBody } from "./common/ControllerBase";

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
          console.log("aDataFim: ", aDataFim, " -- ", aDataFim.toISOString())
    
          const builder = new EstatisticaVendaSQLBuilder();
    
          let query = builder.getGroupByVendedorSQL(aDataInicio, aDataFim);
          const exe1 = AppDataSource.query("REFRESH MATERIALIZED VIEW  public.devolucao_venda_viewm;")
          const exe2 = AppDataSource.query("REFRESH MATERIALIZED VIEW  public.venda_cancelada_viewm;")
          const exe3 = AppDataSource.query("REFRESH MATERIALIZED VIEW  public.venda_duplicata_credito_viewm;")
    
          let repositoty = AppDataSource.getRepository<GroupByVendedorValues>(GroupByVendedorValues);

          Promise.all([exe1, exe2, exe3]);
    
          const query1 = repositoty.query(query).then((lista: GroupByVendedorValues[]) => {
            if (lista.length > 0) {

            }
            res.status(200).send(lista);
          })

          
          console.log("terminou tudo");
    
        } catch (error) {
          res.status(400).send("Não foi realizar o parse das datas informadas. Motivo: " +  error["message"]);
        }
      }
}


export const gestaoVendedoresRouter = Router();

const controller = new GestaoVendedoresController();

gestaoVendedoresRouter.get("/vendas-group-by-vendedor", controller.getRowsGroupByVendedor);

export default gestaoVendedoresRouter;