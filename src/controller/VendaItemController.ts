import { EstatisticaVendaSQLBuilder, GroupByVendedorReturnRow } from './../service/EstatisticaVendaSQLBuilder';
import { AppDataSource } from "./../data-source";
import { PageService } from "./../service/PageService";
import { Response, Router } from "express";
import { VendaItem } from "./../model/entity/VendaItem";
import { BuildRote, Controller, getByModel, TypedRequestBody } from "./common/ControllerBase";
import { exit } from "process";
import { Any, Between } from "typeorm";

export class VendaItemController implements Controller<VendaItem> {
  getByModel(req: TypedRequestBody<VendaItem>, res: Response<any, Record<string, any>>, next: any) {
    getByModel(req, res, next, new PageService<VendaItem>(new VendaItem()));
  }
  getByQuery(req: TypedRequestBody<{ query: string; countQuery: string; numberPage: number }>, res: Response<any, Record<string, any>>, next: any) {
    throw new Error("Method not implemented.");
  }

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

      let query = builder.GroupByVendedor(aDataInicio, aDataFim);

      let repositoty = AppDataSource.getRepository(GroupByVendedorReturnRow);

      repositoty.query(query).then(lista => {
        res.status(200).send(lista);
      })

    } catch (error) {
      res.status(400).send("Não foi realizar o parse das datas informadas. Motivo: " +  error["message"]);
    }
  }
}

export const VendaItemRoute = Router();

const controller = new VendaItemController();

VendaItemRoute.get("/getRowsGroupByVendedor", controller.getRowsGroupByVendedor);

BuildRote(VendaItemRoute, new VendaItemController());

export default VendaItemRoute;
