import express, { Request, Response } from "express";
import routes from "./controller/common/routes";
import factoryDataSource, { initDataSource, resyncDataSource } from "./data-source";
import { encontrarDiretorioViaERP } from "./global";
import envHelper from "./Helpers/EnvHelper";
import ejs = require('ejs');

const app = express();
const morgan = require("morgan");
const winston = require("./config/log");
const cors = require("cors");


class ViaReportApp {

  async start() {
    this.enviromentLog();

    this.initialize();

    await factoryDataSource().initialize();

    //BDs Conectados
    console.log("Bancos de Dados Conectados");

    this.setAppConfigs();

    this.setViews();

    this.setRoutes();

    //Aplicação Iniciada
    console.log("ViaReport Iniciado");

    app.listen(process.env.PORT);
  }

  enviromentLog() {
    if(process.env.PRODUCTION == 'TRUE') {
      console.log("[[Iniciando em Ambiente de Produção]]\n\n");
    } else {
      console.log("[[Iniciando em Ambiente de Desenvolvimento]]]\n\n");
    }
  }

  initialize() {
    encontrarDiretorioViaERP();

    envHelper();

    initDataSource();
  }

  setAppConfigs() {
    app.use(express.json());
    app.use(cors());
    app.use(morgan("combined", { stream: winston.stream }));
  }

  setViews() {
    const path = require('path');
    
    app.set('view engine', 'ejs');
    app.engine('ejs', ejs.__express)
    app.set('views', path.join(__dirname, "views"));
  }

  setRoutes() {
    app.get("/close", (req, res) => {
      process.exit(0);
    })
  
    app.get("/ping", (req: Request, res: Response) => {
      res.status(200).send("OK");
    });

    /**
     * Recarregar Conexões
     */
    app.get('/reload', (req, res) => {
      try {
        envHelper().reloadConfigs();
        if(envHelper().needReloadConnections) resyncDataSource();
        res.status(200).send("OK");
      } catch (error) {
        res.status(500).send("Não foi possível iniciar as conexões ao banco de dados. Erro:" + error["message"]);
      }
    })

    app.use("/v1", (req, res, next) => {
      if (req.headers["cnpj"]) {
        console.log("cnpj: ", req.headers["cnpj"]);
        return next();
      } else if (req.query['cnpj']) {
        console.log("cnpj: ", req.query["cnpj"]);
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