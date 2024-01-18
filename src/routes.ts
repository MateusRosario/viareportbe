import { ComissaoRoute } from './controller/comissao-controller';
import { Router } from "express";
import ProdutoRoute from "./controller/produtos-controller";
import { RegistroRoute } from "./controller/registro-controller";
import VendaRoute from "./controller/venda-controller";
import VendaItemRoute from "./controller/venda-item-controller";
import gestaoVendedoresRouter from './controller/gestao-vendedores-controller';
import vendedorRoute from './controller/vendedor-controller';
import empresaRoute from './controller/empresa-controller';
import DevolucaoRouter from './controller/devolucao-controller';
import DevolucaoItemRouter from './controller/devolucao-item-controller';
import commonComponentsRouter from './controller/common-components-controller';
/**
 * @description aqui é o arquivo que vai exportar todas as rotas que possuem ou não sub-rotas seria por exemplo o inicio / da aplicação
 */

const routes = Router();

/**
 * Página Gestão de Vendedores
 * -- componentes
 *       VendedorDashBoard
 *       Comissao
 * 
 * -- requests
 *      /vendas-group-by-vendedor
 */
routes.use('/gestao-vendedores', gestaoVendedoresRouter);

/**
 * Página Analitico Forma de Pagamento
 * requests comissao
 */
routes.use('/comissao', ComissaoRoute);

/** requests */
routes.use('/venda', VendaRoute);
routes.use('/vendedor', vendedorRoute);
routes.use('/devolucao', DevolucaoRouter);

/** base requests apenas */
routes.use('/registro', RegistroRoute);
routes.use('/produto', ProdutoRoute);
routes.use('/venda_item', VendaItemRoute);
routes.use('/empresa', empresaRoute);
routes.use('/devolucao_item', DevolucaoItemRouter);

/** Components render */
routes.use('/commonComponent', commonComponentsRouter);

routes.get("/test", (req, res) => {
    res.render("PageTest", {cnpj: req.headers["cnpj"]});
});

export default routes