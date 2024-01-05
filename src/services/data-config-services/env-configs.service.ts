import { assert } from "console";
import { root_directory } from "../../global";
import viaERPService from "./viaerp.service";

/**
 * Busca e lê configurações de ambiente no arquivos de configuração
 * do ViaERP - ViaERP.ini
 * 
 * Ou se conf
 * 
 * @author Mateus Rosario
 */
class EnvConfigsService {
    private _configs;
    private configsChanged = false;

    constructor() {
        this.loadConfigs();
    }

    private loadDevConfigs(): any {
        const msg = (faltante) => 
        `Forneça a variavel '${faltante}' no ambiente 
        de desenvolvimento (dev.env), ou desative 
        'USE_DEV_DB' e busque do diretório do ViaERP`;

        assert(process.env.DB_HOSTNAME != undefined, msg('DB_HOSTNAME'));
        assert(process.env.DB_DATABASE != undefined, msg('DB_DATABASE'));
        assert(process.env.DB_PORTA != undefined, msg('DB_PORTA'));

        return {
            Conexao: {
                Hostname: process.env.DB_HOSTNAME,
                Database: process.env.DB_DATABASE,
                Porta: process.env.DB_PORTA
            }
        }
    }

    private loadConfigs(): boolean {
        const isInitialization = this._configs == undefined;

        if(process.env.USE_DEV_DB == 'TRUE') {
            this._configs = this.loadDevConfigs();
            if(isInitialization) {
                return true;
            } else {
                return false;
            }
        }

        //const configs = this.readConfigs();
        const configs = viaERPService().readConfigs();
        const hasNewConfigurations = configs != this._configs;
        if(hasNewConfigurations) {
            
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
