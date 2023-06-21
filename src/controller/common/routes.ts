import { ComissaoRoute } from '../comissao-controller';
import { Router } from "express";
import ProdutoRoute from "../produtos-controller";
import { RegistroRoute } from "../registro-controller";
import VendaRoute from "../venda-controller";
import VendaItemRoute from "../venda-item-controller";
import gestaoVendedoresRouter from '../gestao-vendedores-controller';
import vendedorRoute from '../vendedor-controller';
import empresaRoute from '../empresa-controller';
/**
 * @description aqui é o arquivo que vai exportar todas as rotas que possuem ou não sub-rotas seria por exemplo o inicio / da aplicação
 */

const routes = Router();

routes.use('/registro', RegistroRoute);
routes.use('/produto', ProdutoRoute);
routes.use('/venda', VendaRoute);
routes.use('/venda_item', VendaItemRoute);
routes.use("/comissao", ComissaoRoute);
routes.use("/gestao-vendedores", gestaoVendedoresRouter)
routes.use("/vendedor", vendedorRoute);
routes.use("/empresa", empresaRoute);




export default routes