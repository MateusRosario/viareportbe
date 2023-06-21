export enum DataBaseType {
    POSTGRES = "postgres",
    MYSQL = "mysql",
  }

export class DataBaseConfig {
  cnpj: string;
  type: DataBaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;

  constructor(host: string, database: string, port: number) {
    this.host = host;
    this.database = database;
    this.port = port;
    this.type = DataBaseType.POSTGRES;
    this.username = "ViaERP";
    this.password = "Via7216";
    this.cnpj = "";
  }
}