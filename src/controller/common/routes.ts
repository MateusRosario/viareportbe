import { ComissaoRoute } from './../ComissaoController';
import { Router } from "express";
import ProdutoRoute from "../ProdutoController";
import { RegistroRoute } from "../RegistroController";
import VendaRoute from "../VendaController";
import VendaItemRoute from "../VendaItemController";
/**
 * @description aqui é o arquivo que vai exportar todas as rotas que possuem ou não sub-rotas seria por exemplo o inicio / da aplicação
 */

const routes = Router();

routes.use('/registro', RegistroRoute);
routes.use('/produto', ProdutoRoute);
routes.use('/venda', VendaRoute);
routes.use('/venda_item', VendaItemRoute);
routes.use("/comissao", ComissaoRoute);




export default routes