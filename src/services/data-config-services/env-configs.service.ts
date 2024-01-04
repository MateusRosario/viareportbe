import { root_directory } from "../../global";

/**
 * Busca e lê configurações de ambiente no arquivos de configuração
 * do ViaERP
 * @author Mateus Rosario
 */
class EnvConfigsService {
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
            return true;
        }

        // no need to reload database configs
        return false;
    }

    reloadConfigs(): boolean {
        return this.loadConfigs();
    }

    /**
     * Verifica se foi encontrado mudanças na ultima leitura das 
     * configs.
     * 
     * Ao chamar esta função, status de mudanças é resetado
     * para sem mudanças.
     */
    get needReloadConnections(): boolean {
        if(this.configsChanged) {
            this.configsChanged = false;
            return true;
        }

        return false;
    }

    get configs(): any {
        return this._configs;
    }
}

var envConfigsServiceSingleton = undefined;

export default function envConfigsService(): EnvConfigsService {
    if(envConfigsServiceSingleton == undefined) {
        envConfigsServiceSingleton = new EnvConfigsService();
    }
    
    return envConfigsServiceSingleton;
}