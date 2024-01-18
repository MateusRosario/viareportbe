import express, { Request, Response } from "express";
import routes from "./routes";
import { dbConnectionService } from "./services/data-config-services/db-connection.service";
import envConfigsService from "./services/data-config-services/env-configs.service";
import ejs = require('ejs');
import logService from "./services/log-services/logger.service";

const cors = require("cors");
const app = express();
const path = require('path');

const Log = logService();

class ViaReportApp {

  async start() {

    Log.file('Aplication Start-up', Date.now().toLocaleString());

    try {

      this.enviromentLog();

      await this.initializeDataBaseConnections();

      this.setAppConfigs();
  
      this.setViews();
  
      this.setRoutes();
  
      //Aplicação Iniciada
      logService().log("--- [[ViaReport Iniciado]] ---\n\n");
  
      app.listen(process.env.PORT || 9005);

    } catch(Exeption) {
      console.error(Exeption);
      Log.file(Exeption);
      while (true) {}
    }
  }

  enviromentLog() {
    if(process.env.PRODUCTION == 'TRUE') {
      Log.log("--- [[Iniciando em Ambiente de Produção]] ---\n\n");
    } else {
      Log.log("--- [[Iniciando em Ambiente de Desenvolvimento]] ---\n\n");
    }
  }

  async initializeDataBaseConnections(): Promise<void> {
    return dbConnectionService().initializeConnections().then(() => {
      //BDs Conectados
      Log.log("Bancos de Dados Conectados\n\n");
    }).catch(() => {
      //Nenhum Banco Conectado
      Log.log('Nenhuma conexão com banco foi estabelecida!\n\n');
    });
  }

  setAppConfigs() {
    app.use(express.json());
    app.use(cors());
    app.use(Log.httpLogger());
  }

  setViews() {
    app.set('view engine', 'ejs');
    app.engine('ejs', ejs.__express);
    app.set('views', path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, 'views')));
    app.use('/public', express.static(path.join(__dirname, 'assets')));
  }

  setRoutes() {
    app.get("/close", (req, res) => {
      process.exit(0);
    });
  
    app.get("/ping", (req: Request, res: Response) => {
      res.status(200).send("OK");
    });

    /**
     * Recarregar Conexões
     */
    app.get('/reload', async (req, res) => {
      try {
        envConfigsService().reloadConfigs();
        if(envConfigsService().needReloadConnections) {
          await dbConnectionService().resyncConnections();
        }
        res.status(200).send("OK");
      } catch (error) {
        res.status(500).send("Não foi possível iniciar as conexões ao banco de dados. Erro:" + error["message"]);
      }
    })

    app.use("/v1", (req, res, next) => {

      if (req.headers["cnpj"]) {
        //console.log("cnpj: ", req.headers["cnpj"]);
        return next();
      } else if (req.query['cnpj']) {
        //console.log("cnpj: ", req.query["cnpj"]);
        req.headers['cnpj'] = req.query['cnpj'].toString();
        return next();
      } else {
        next(new Error("Não informou o CNPJ"));
      }
    })

    app.use("/v1", routes);
  }
}

new ViaReportApp().start();