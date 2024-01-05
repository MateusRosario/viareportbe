import { Request, Response, Router, Express } from "express";
import { PageService } from "../../services/PageService";
import { Page } from "../../model/apoio/page";
import { isValid } from "../../services/FunctionsServices";

export interface TypedRequestBody<T> extends Express.Request, Request {
  body: T;
}

export interface Controller<T> {
  getByModel(req: TypedRequestBody<T>, res: Response, next);
  getByQuery(req: TypedRequestBody<{ query: string; countQuery: string }>, res: Response, next);
}

export function BuildPage<T>(req: TypedRequestBody<any>): Page<T> {
  let page = undefined;
  let sort = undefined;
  let size = undefined;
  let pageInfo: { page: number; size: number; sort: { fields: string; dir: "ASC" | "DESC" } };

  const retorno = Page.CreatePage<T>();

  if (isValid(req.body["pageInfo"])) {
    pageInfo = req.body["pageInfo"];
    if (isValid(pageInfo.page)) page = pageInfo.page;
    if (isValid(pageInfo.size)) size = pageInfo.size;
    if (isValid(pageInfo.sort)) sort = pageInfo.sort;
  } else {
    try {
      page = req.query["page"];
    } catch (error) {
      console.error(error);
    }

    try {
      sort = req.query["sort"];
    } catch (error) {
      console.error(error);
    }

    try {
      size = req.query["size"];
    } catch (error) {
      console.error(error);
    }
  }

  if (isValid(page)) retorno.number = page;

  if (isValid(sort)) {
    retorno.sort = {
      fields: sort.substring(0, sort.lastIndexOf(",")),
      dir: sort.substring(sort.lastIndexOf(",")) === "ASC" ? "ASC" : "DESC",
    };
  }
  if (isValid(size)) retorno.size = size;

  return retorno;
}

export function BuildRote<S extends Controller<any>>(route: Router, cont: S) {
  route.post("/get_by_model", cont.getByModel);
  route.post("/get_by_query", cont.getByQuery);
}

export async function getByModel<T>(req: TypedRequestBody<T>, res: Response, next, service: PageService<T>) {
  try {
    const page = BuildPage<T>(req);
    return res.send(await service.findByExemple(req.body, page));
  } catch (error) {
    next(error);
    return res.status(500).send(error);
  }
}
