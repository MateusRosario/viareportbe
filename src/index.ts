
import express, { Request, Response } from "express";
import routes from "./controller/common/routes";
import { httpException } from "./model/exceptions/httpExceptions";
import { ErroHandle } from "./config/log";
import * as dotenv from "dotenv";
import factoryDataSource, { initDataSource, resyncDataSource } from "./data-source";
import { initReadWritedotEnv, reloadConnections, syncConfigDataBase } from "./Helpers/WriteReadDotEnv";
import { encontrarDiretorioViaERP } from "./global";
import ejs = require('ejs');

const app = express();
const morgan = require("morgan");
const winston = require("./config/log");
const cors = require("cors");

encontrarDiretorioViaERP()

initReadWritedotEnv();

initDataSource();

factoryDataSource().initialize(() => {
  console.log("Iniciou")
  app.use(express.json());
  app.use(cors());
  app.use(morgan("combined", { stream: winston.stream }));
  const path = require('path');

  app.set('view engine', 'ejs');
  app.engine('ejs', ejs.__express)
  app.set('views', path.join(__dirname, "views"));


  app.use(function (err: httpException, req: Request, res: Response, next) {
    ErroHandle(err, req, res, next);
  });

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


  app.get('/reload', (req, res) => {
    try {
      syncConfigDataBase()
      reloadConnections() ? resyncDataSource() : "";
      res.status(200).send("OK");
    } catch (error) {
      res.status(500).send("Não foi possível iniciar as conexões ao banco de dados. Erro:" + error["message"]);
    }
  })

  app.get("/close", (req, res) => {
    process.exit(0);
  })


  app.get("/ping", (req: Request, res: Response, next) => {
    res.status(200).send("OK");
  });
  app.use("/v1", routes);

  app.listen(8181);

});
