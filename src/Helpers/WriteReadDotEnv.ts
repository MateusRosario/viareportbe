import { DataBaseConfig } from "../data-base-config";
import { root_directory } from "../global";
import { config } from "dotenv";

var hash = { old: "", new: "" };

class ReadWritedotEnv {
  private envFilePath;
  private fs;
  private os;
  private path;
  private writter;

  constructor() {
    this.fs = require("fs");
    this.os = require("os");
    this.path = require("path");

    this.envFilePath = root_directory + this.path.sep + ".env";

    config({ path: root_directory });

    console.log("\n\n\nenvFilePath ==== ", this.envFilePath, "\n\n");

    this.writter = this.fs.createWriteStream(this.envFilePath);

    this.writter.on("error", (error) => {
      console.error(`An error occured while writing to the file. Error: ${error.message}`);
    });

    this.readViaERPini();
  }

  readViaERPini(): DataBaseConfig[] {
    const ini = require("ini");
    const { sep } = require("path");

    console.log('\n\n', sep, '\n\n');

    const diretorio = root_directory.split(sep);

    let viaerp = "";

    for (let i = 0; i < diretorio.length && i < 2; i++) {
      viaerp = viaerp.concat(diretorio[i], sep);
    }

    if (!viaerp[2].toLowerCase().includes("viaerp")) {
      viaerp = viaerp.split(sep)[0] + sep + "ViaERP";
    }

    viaerp = viaerp.concat(sep, "ViaERP.ini");

    console.log(viaerp, '\n');

    const config = ini.parse(this.fs.readFileSync(viaerp, "utf-8"));

    console.log(config);

    let configDatabase: DataBaseConfig[] = [];

    //É POSSÍVEL RECONFIGURAR AS CONEXÕES DEPOIS QUE O SERVIDOR FOI INICIADO
    //FOI USADA A LOGÍSTCA ABAIXO PARA VERIFICAR SE HOUVE ALGUMAS ALTERAÇÃO NAS CONFIGURAÇÕES DESDE A ÚTLIMA VEZ QUE O ViaERP.ini foi lido
    if (hash.old.length === 0 && hash.new.length === 0) {
      hash.old = JSON.stringify(config);
      hash.new = JSON.stringify(config);
    } else hash.new = JSON.stringify(config);

    for (let i = 0; i <= 4; i++) {
      let index = (a) => {
        if (a === 0) return "";
        else if (a >= 1) return a + 1;
      };

      if (config["Conexao"]["Hostname" + index(i)] !== undefined && config["Conexao"]["Hostname" + index(i)] != null) {
        configDatabase.push(
          new DataBaseConfig(config["Conexao"]["Hostname" + index(i)] as string, config["Conexao"]["Database" + index(i)] as string, config["Conexao"]["Porta" + index(i)] as number)
        );
      }
    }

    //ATUALIZANDO A VÁRIÁVEL DE AMBIENTE QUE GUARDA AS INFORMAÇÕES RELACIONADAS AS CONFIGURAÇÕES DE BANCO DE DADOS
    this.setEnvValue("CONFIGS",  JSON.stringify(configDatabase));

    return configDatabase;
  }

  /**
   * Finds the key in .env files and returns the corresponding value
   *
   * @param {string} key Key to find
   * @returns {string|null} Value of the key
   */
  getEnvValue(key: string): string {
    return process.env[key];
  }

  setEnvValue(key, value) {
    process.env[key] = value;
  }
}

var _readWritedotEnv: ReadWritedotEnv;
var _inicializado = false;

/**
 * @return Retorna uma instância da class ReadWritedotEnv. Antes de utilizar está função, deve ser executada a function initReadWritedotEnv();
 */
export function readWritedotEnv(): ReadWritedotEnv {
  return _readWritedotEnv;
}


/**
 * @description Realiazaa leitura do ViaERP.ini e salva as informações relacionadas a conexão ao banco de dados em uma variável de ambiente.
 */
export function initReadWritedotEnv() {
  if (!_inicializado) {
    _readWritedotEnv = new ReadWritedotEnv();
  } else {
    throw new Error("Intância singleton ReadWritedotEnv já foi inicializada.");
  }
}

/**
 * @description Realiza a leitura novamente do ViaERP.ini se observar a variável _inicializado. Está última variável privada determina se já ocorreu a leitira do ViaERP.ini
 */
export function syncConfigDataBase() {
  _readWritedotEnv = new ReadWritedotEnv();
}

/**
 * 
 * @returns Retorna true se o ViaERP.ini foi atualizado desde a última vez que foi lido
 */
export function reloadConnections(): boolean {
  return hash.old != hash.new;
}

// CONFIGS = [{ cnpj: "32.310.156/0001-65", type: "postgres", host: "127.0.0.1", port: 5432, username: "ViaERP", password: "Via7216", database: "01351" }];
