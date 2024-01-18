import { readdirSync } from "fs";
import logService from "../log-services/logger.service";

const nodeDiskInfo = require("node-disk-info");
const path = require("path");

class ViaERPService {
    private _diretorio: string;

    constructor() {
        this.loadsDiretorioViaERP();
    }

    private loadsDiretorioViaERP() {
        try {
            if (process.env.PRODUCTION == 'TRUE' || process.env.PRODUCTION == undefined) {
                const dir = this.searchViaERPRepository();
                if(dir != undefined) {
                    this._diretorio = dir;
                } else {
                    logService().file('Diretório do ViaERP não identificado');
                    return;
                }
            } else {
                const args = process.argv;

                if (process.env.VIAERP_DIR != undefined) {
                    this._diretorio = process.env.VIAERP_DIR;
                } else if (args.length > 2 && args[2] != undefined) {
                    this._diretorio = process.env.VIAERP_DIR;
                } else {
                    console.error('Erro: Variável de ambiente de desenvolvimento "VIAERP_DIR" não configurada!');
                    process.exit(0);
                }
            }

            console.log('Diretório do ViaERP Localizado: ', this._diretorio, '\n\n');
        } catch (e) {
            console.log(`Algo Falhou`);
            console.error(e);
        }
    }

    searchViaERPRepository(): string | undefined {
        const viaERP_home = process.env.ViaERP_home;
        if(viaERP_home == undefined) {
            const disks = nodeDiskInfo.getDiskInfoSync();

            const dirs = [];
            for (let i = 0; i < disks.length; i++) {
                if (ViaERPService.hasViaERPDirectory(disks[i].mounted + path.sep)) {
                    dirs.push(disks[i].mounted + path.sep + "ViaERP");
                    console.log('root dir:', this._diretorio);
                    console.log("ACHOU O DIRETÓRIO DO VIAERP: ",this._diretorio);
                }
            }

            if(dirs.length == 0) {
                return undefined;
            } else if(dirs.length == 1) {
                console.log('Diretório o ViaERP: ', this._diretorio);
                return dirs[0];
            } else if(dirs.length > 1) {
                this._diretorio = dirs.pop();
                console.log('Multiplos diretórios do ViaERP encontrados!\n'
                    + 'Não há configuração da variável de ambiente "ViaERP_home"!\n'
                    + 'Ultimo diretório será selecionado: ', this._diretorio);
                return dirs.pop();
            }
        } else {
            return viaERP_home;
        }

        return undefined;
    }

    readConfigs(): any {
        const ini = require("ini");
        const path = require("path");
        const fs = require("fs");

        const diretorio = this.diretorio.split(path.sep);

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

    get diretorio(): string {
        return this._diretorio;
    }

    private static hasViaERPDirectory = source => {
        const result = readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.toLowerCase() === "viaerp")
            .map(dirent => dirent.name);

        return (result.length === 1);
    };
}

var viaERPServiceSingleton = undefined;

export default function viaERPService(): ViaERPService {
    if(viaERPServiceSingleton == undefined) {
        viaERPServiceSingleton = new ViaERPService();
    }
    
    return viaERPServiceSingleton;
}