import { DataBaseConfig } from "../data-base-config";
import { root_directory } from "../global";

class EnvHelper {
    private _configs;
    private configsChanged = false;

    constructor() {
        this.loadConfigs();
    }

    private readConfigs(): any {
        const ini = require("ini");
        const path = require("path");
        const fs = require("fs");
    
        const diretorio = root_directory.split(path.sep);
    
        let viaerp = "";
    
        for (let i = 0; i < diretorio.length && i < 2; i++) {
          viaerp = viaerp.concat(diretorio[i], path.sep);
        }
    
        if (!viaerp[2].toLowerCase().includes("viaerp")) {
          viaerp = viaerp.split(path.sep)[0] + path.sep + "ViaERP";
        }
    
        viaerp = viaerp.concat(path.sep, "ViaERP.ini");
    
        console.log('Lendo configs em ', viaerp, '\n');
    
        const config = ini.parse(fs.readFileSync(viaerp, "utf-8"));

        console.log('Configurações ViaERP.ini:\n', config, '\n\n');

        return config;
    }

    private loadConfigs(): boolean {
        const configs = this.readConfigs();
        const hasNewConfigurations = configs != this._configs;
        if(hasNewConfigurations) {
            const isInitialization = this._configs == undefined
            if(!isInitialization) {
                this.configsChanged = true;
            }

            this._configs = configs;
            // reload database configs
            const dbConfigs = EnvHelper.dbConfigs(this._configs);
            this.setEnvValue('CONFIGS', JSON.stringify(dbConfigs));
            return true;
        }

        // no need to reload database configs
        return false;
    }

    reloadConfigs(): boolean {
        return this.loadConfigs();
    }

    get needReloadConnections(): boolean {
        return this.configsChanged;
    }

    get configs(): any {
        return this._configs;
    }

    getEnvValue(key: string): string {
        return process.env[key];
    }
    
    setEnvValue(key, value) {
        process.env[key] = value;
    }

    private static dbConfigs(configs: any): DataBaseConfig[] {
        let configsDatabase: DataBaseConfig[] = [];

        for (let n = 0; n <= 4; n++) {

            let index = (num) => {
              if (num === 0) return "";
              else if (num >= 1) return num + 1;
            };

            const conexaoExists = configs["Conexao"]["Hostname" + index(n)] !== undefined
      
            if (conexaoExists) {

              configsDatabase.push(
                new DataBaseConfig(
                    configs["Conexao"]["Hostname" + index(n)] as string, 
                    configs["Conexao"]["Database" + index(n)] as string, 
                    configs["Conexao"]["Porta" + index(n)] as number)
              );
            }
        }

        return configsDatabase;
    }
}

var envHelperSingleton = undefined;

export default function envHelper(): EnvHelper {
    if(envHelperSingleton == undefined) {
        envHelperSingleton = new EnvHelper();
    }
    
    return envHelperSingleton;
}