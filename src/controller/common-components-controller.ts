import { Response, Router } from 'express';
import { TypedRequestBody } from './common/ControllerBase';
import { PageService } from '../services/PageService';
import { Empresas } from '../model/entity/empresas';
import { EmpresasConfiguracoes } from '../model/entity/empresas-configuracoes';

class CommonComponentsController {
    async renderRelatoriosHeader(req: TypedRequestBody<{titulo: string, filtros: any}>, res: Response, next: any) {
        let service = new PageService<Empresas>(new Empresas(), req.headers["cnpj"] as string);
        let empresa = (await service.findByExemple(new Empresas())).content[0];

        let serviceEmpresaConfigs = new PageService<EmpresasConfiguracoes>(new EmpresasConfiguracoes(), req.headers["cnpj"] as string);
        let ex = new EmpresasConfiguracoes();
        ex.empresa = empresa;

        let config = (await serviceEmpresaConfigs.findByExemple(ex)).content[0];

        var img = "data:image/jpg" + ';base64,' + Buffer.from(config.img_relatorio, 'binary').toString('base64');

        res.render('components/header', {
            imgLogo: img,
            empresa: empresa,
            titulo: req.body.titulo || 'Título não Fornecido',
            filtros: req.body.filtros,
        });
    }

    renderRelatoriosFooter(req: TypedRequestBody<void>, res: Response, next: any) {
        res.render('components/footer', {
            imgViaTech: `${process.env.BASEURL}:${process.env.PORT}/public/logos/logo.png`,
        });
    }
}

const commonComponentsRouter = Router();

const commonComponentsController = new CommonComponentsController();

commonComponentsRouter.post('/header', commonComponentsController.renderRelatoriosHeader);
commonComponentsRouter.get('/header', commonComponentsController.renderRelatoriosHeader);

commonComponentsRouter.post('/footer', commonComponentsController.renderRelatoriosFooter);
commonComponentsRouter.get('/footer', commonComponentsController.renderRelatoriosFooter);

export default commonComponentsRouter;

