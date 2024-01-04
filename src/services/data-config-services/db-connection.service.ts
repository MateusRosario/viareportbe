import { Cliente } from '../../model/entity/Cliente';
import { Produto } from '../../model/entity/Produto';
import { GrupoProduto } from '../../model/entity/GrupoProduto';
import { FormaPagamento } from '../../model/entity/FormaPagamento';
import { DevolucaoItem } from '../../model/entity/devolucao-item';
import { Devolucao } from '../../model/entity/devolucao';
import { VendaItem } from '../../model/entity/VendaItem';
import { Venda } from '../../model/entity/Venda';
import { Vendedor } from '../../model/entity/Vendedor';
import { Usuarios } from '../../model/entity/Usuarios';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DataBaseConfigModel } from "./data-base-config.model";
import { Empresas } from "../../model/entity/empresas";
import { DevolucaoVendaViewm } from '../../model/entity/devolucao-venda-viewm';
import { DevolucaoItemView } from '../../model/apoio/devolucao-item-view';
import { VendaCanceladaViewm } from '../../model/entity/venda-cancelada-viewm';
import { VendaDuplicata } from '../../model/entity/venda-duplicata';
import envConfigsService from './env-configs.service';

const ENTITIES = [Empresas, Usuarios, Vendedor, Empresas, Venda, VendaItem, Devolucao, DevolucaoItem, FormaPagamento, GrupoProduto, Produto, Cliente, DevolucaoVendaViewm, DevolucaoItemView, VendaCanceladaViewm, VendaDuplicata]

/**
 * @description Classe responsável por genreciar as conexões ao banco de dados. 
 * Utiliza DBConnectionService para ler configurações de Banco
 */
class DBConnectionService {
  private dataBaseConfigs: DataBaseConfigModel[] = [];
  private connections: DataSource[] = [];
  private initialized: boolean = false;

  constructor() {
    this.createDataBaseConfigs();
  }

  private createDataBaseConfigs() {
    this.dataBaseConfigs = [];
    this.connections = [];
    this.initialized = false;
    
    const configs = envConfigsService().configs;
    this.dataBaseConfigs = DBConnectionService.dbConfigs(configs);

    if (this.dataBaseConfigs == undefined) throw new Error("Não foi possível ler a propriedade CONFIGS do ambiente");

    if (this.dataBaseConfigs.length === 0) throw new Error("O arquivo de configuração das conexões do banco de dados está vázio.");

    this.dataBaseConfigs.forEach((value, index) => {
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
          logging: false,
          entities: ENTITIES,
          migrationsRun: false,
          subscribers: [],
        });
        _index = this.connections.push(con);
      } catch (error) {
        // console.log("Não foi possível estabelecer a conexão ao banco de dados ", value.host, ":", value.port, "/", value.database);
        this.dataBaseConfigs.splice(_index, 1);
      }
    });
  }

  /**
   * @description Este método deve ser invocado para iniciar as conexões com o database.
   * @param callback Deve ser informada uma função de callback para logo após as conexões serem estabelecidas, iniciar a API. Se iniciar a API antes das conexões, possívelmente a primeira consulta  a API retornará erro.
   */
  public async initializeConnections(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let promises = [];

      if (!this.initialized) {
        let deleteConenctions = [];
        this.connections.forEach((value, index) => {
          promises.push(
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
                      this.dataBaseConfigs[index].cnpj = empresa[0].cnpj.replace(/[^0-9]/g, "");
                    }
                  });
              },
              (error) => {
                deleteConenctions.push(index);
                console.error(index, "- Não foi possível estabelecer a conexão ao banco de dados ", this.dataBaseConfigs[index].host, ":", this.dataBaseConfigs[index].port, "/", this.dataBaseConfigs[index].database, " / Error: ", error["message"]);              
              }
            )
          );
        });
        
        Promise.all(promises).then(() => {
          this.initialized = true;
          if (deleteConenctions.length > 0) {
            deleteConenctions.forEach((i: number, index: number) => {
              this.dataBaseConfigs.splice(i, 1);
              this.connections.splice(i, 1);
            });
          }
          resolve();
        });
      } else {
        reject();
      }
    });
  }

  resyncConnections(): Promise<void> {
    this.createDataBaseConfigs();
    return this.initializeConnections();
  }

  getConnection(cnpj: string): DataSource {
    if (!this.initialized) {
      throw new Error("As conexões não foram inicializadas. Execute a inicialização do serviço de conexão 'dBConnectionServiceSingleton'");
    }

    let numeros = cnpj.replace(/[^0-9]/g, "");
    let encontrado = -1;

    const founded = this.dataBaseConfigs.filter((value, index) => {
      // console.log(value.cnpj.replace(/[^0-9]/g, ""), " === ", numeros)
      if (value.cnpj.replace(/[^0-9]/g, "") === numeros) {
        encontrado = index;
        return value;
      }
    });

    if (founded.length === 0) throw new Error("Não foi possível estabelecer a conexão, CNPJ inválido.");

    // console.log("CONEXÃO ENCONTRADA: ", founded[0].host, ':', founded[0].port, '/', founded[0].database);
    
    return this.connections[encontrado];
  }

  private static dbConfigs(configs: any): DataBaseConfigModel[] {
    let configsDatabase: DataBaseConfigModel[] = [];

    for (let n = 0; n <= 4; n++) {

        let index = (num) => {
          if (num === 0) return "";
          else if (num >= 1) return num + 1;
        };

        const conexaoExists = configs["Conexao"]["Hostname" + index(n)] !== undefined
  
        if (conexaoExists) {

          configsDatabase.push(
            new DataBaseConfigModel(
                configs["Conexao"]["Hostname" + index(n)] as string, 
                configs["Conexao"]["Database" + index(n)] as string, 
                configs["Conexao"]["Porta" + index(n)] as number)
          );
        }
    }

    return configsDatabase;
  }
}

var dBConnectionServiceSingleton: DBConnectionService;

export function dbConnectionService() {
  if(dBConnectionServiceSingleton == undefined) {
    dBConnectionServiceSingleton = new DBConnectionService();
  }

  return dBConnectionServiceSingleton;
}

export function getDBConnection(cnpj: string): DataSource {
  return dBConnectionServiceSingleton.getConnection(cnpj);
}