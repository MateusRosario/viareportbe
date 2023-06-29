import { Cliente } from './model/entity/Cliente';
import { Produto } from './model/entity/Produto';
import { GrupoProduto } from './model/entity/GrupoProduto';
import { FormaPagamento } from './model/entity/FormaPagamento';
import { DevolucaoItem } from './model/entity/devolucao-item';
import { Devolucao } from './model/entity/devolucao';
import { VendaItem } from './model/entity/VendaItem';
import { Venda } from './model/entity/Venda';
import { Vendedor } from './model/entity/Vendedor';
import { Usuarios } from './model/entity/Usuarios';
import { root_directory } from './global';
import "reflect-metadata";
import { Any, DataSource } from "typeorm";
import { isValid } from "./service/FunctionsServices";
import { DataBaseConfig } from "./data-base-config";
import { Empresas } from "./model/entity/empresas";
import { Console } from "console";
import { readWritedotEnv } from "./Helpers/WriteReadDotEnv";

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: "127.0.0.1",
//   port: 5432,
//   username: "ViaERP",
//   password: "Via7216",
//   database: "01351",
//   synchronize: false,
//   logging: true,
//   entities: [`${__dirname}/**/model/entity/*.{ts, js}`],
//   migrationsRun: false,
//   subscribers: [],
// });

/**
 * @description Classe responsável por genreciar as conexões ao banco de dados. É necessário utilizar o arquivo de configuração .env. Está classe irá ler a propriedade @var CONFIGS do .env *
 */
class FactoryConnection {
  private configs: DataBaseConfig[] = [];
  private connections: DataSource[] = [];
  private initialized: boolean = false;

  constructor() {
    this.configs = [];
    this.connections = [];
    this.initialized = false;

    let text = readWritedotEnv().getEnvValue("CONFIGS");

    this.configs = JSON.parse(text);

    if (!isValid(this.configs)) throw new Error("Não foi possível ler a propriedade CONFIGS do arquivo de configuração .env .");

    if (this.configs.length === 0) throw new Error("O arquivo de configuração das conexões do banco de dados está vázio.");

    this.configs.forEach((value, index) => {
      let _index = index;
      try {
        let con = new DataSource({
          type: value.type,
          host: value.host,
          port: value.port,
          username: value.username,
          password: value.password,
          database: value.database,
          synchronize: false,
          logging: true,
          entities: [Empresas, Usuarios, Vendedor, Empresas, Venda, VendaItem, Devolucao, DevolucaoItem, FormaPagamento, GrupoProduto, Produto, Cliente],
          migrationsRun: false,
          subscribers: [],
        });
        _index = this.connections.push(con);
      } catch (error) {
        console.log("Não foi possível estabelecer a conexão ao banco de dados ", value.host, ":", value.port, "/", value.database);
        this.configs.splice(_index, 1);
      }
    });
  }

  /**
   * @description Este método deve ser invoado para iniciar as conexões com o database.
   * @param call Deve ser informada uma função de callback para logo após as conexões serem estabelecidas, iniciar a API. Se iniciar a API antes das conexões, possívelmente a primeira consulta  a API retornará erro.
   */
  public async initialize(callback) {
    let promise = [];

    if (!this.initialized) {
      let deleteConenctions = [];
      this.connections.forEach((value, index) => {
        promise.push(
          value.initialize().then(
            async (value) => {
              await value
                .getRepository(Empresas)
                .createQueryBuilder("e")
                .limit(1)
                .orderBy({ id: "ASC" })
                .getMany()
                .then((empresa) => {
                  if (empresa) {
                    this.configs[index].cnpj = empresa[0].cnpj.replace(/[^0-9]/g, "");
                  }
                });
            },
            (error) => {
              deleteConenctions.push(index);
              console.error(index, "- Não foi possível estabelecer a conexão ao banco de dados ", this.configs[index].host, ":", this.configs[index].port, "/", this.configs[index].database, " / Error: ", error["message"]);              
            }
          )
        );
      });
      
      await Promise.all(promise).then(() => {
        this.initialized = true;
        if (deleteConenctions.length > 0) {
          deleteConenctions.forEach((i: number, index: number) => {
            this.configs.splice(i, 1);
            this.connections.splice(i, 1);
          });
        }
        callback();
      });
    }
  }

  getConnection(cnpj: string): DataSource {
    if (!this.initialized) {
      throw new Error("As conexões não foram inicializadas. Execute o método initialize(callback)");
    }
    let numeros = cnpj.replace(/[^0-9]/g, "");
    let encontrado = -1;

    const founded = this.configs.filter((value, index) => {
      console.log(value.cnpj.replace(/[^0-9]/g, ""), " === ", numeros)
      if (value.cnpj.replace(/[^0-9]/g, "") === numeros) {
        encontrado = index;
        return value;
      }
    } )

    // let encontrado = -1;

    // if (encontrado === -1) {
    //   this.configs.forEach((value, index) => {
    //     if (value.cnpj.replace(/[^0-9]/g, "") === numeros) {
    //       encontrado = index;
    //     }
    //   });
    // } else {
    //   throw new Error("Não foi possível estabelecer a conexão, CNPJ inválido.");
    // }

    if (founded.length === 0) throw new Error("Não foi possível estabelecer a conexão, CNPJ inválido.");

    console.log("CONEXÃO ENCONTRADA: ", founded[0].host, ':', founded[0].port, '/', founded[0].database);
    
    return this.connections[encontrado];
  }
}

/**
 * @description Instância responsável por genreciar as conexões ao banco de dados. É necessário utilizar o arquivo de configuração .env. Está instância irá ler a propriedade CONFIGS do arquivo de configuração .env *
 */

var _factoryDataSource: FactoryConnection;

export default function factoryDataSource() {
  return _factoryDataSource;
}

export function initDataSource() {
  _factoryDataSource = new FactoryConnection();
}

export function resyncDataSource() {
  initDataSource();
  factoryDataSource().initialize(()=> {

  }); 
}

export function getConnection(cnpj: string): DataSource {
  return _factoryDataSource.getConnection(cnpj);
}
