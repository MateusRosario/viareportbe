import { readdirSync } from 'fs'

const nodeDiskInfo = require('node-disk-info')
const path = require("path");


export var root_directory = __dirname;

const hasViaERPDirectory = source => {
    const result = readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.toLowerCase() === "viaerp")
        .map(dirent => dirent.name);

    return (result.length === 1);
}

export function encontrarDiretorioViaERP() {
    try {
        if(process.env.PRODUCTION == 'TRUE') {
            const disks = nodeDiskInfo.getDiskInfoSync();

            for (let i = 0; i < disks.length; i++) {
                if (hasViaERPDirectory(disks[i].mounted + path.sep)) {
                    root_directory = disks[i].mounted + path.sep + "ViaERP" + path.sep + "Modulos" + path.sep + "ViaReport";
                    console.log('root dir:', root_directory);
                    console.log("ACHOU O DIRETÓRIO DO VIAERP: ", root_directory);
                    break
                }
            }
        } else {
            const args = process.argv;

            if(process.env.VIAERP_DIR != undefined) {
                root_directory = process.env.VIAERP_DIR;
            } else if(args.length > 2 && args[2] != undefined){
                root_directory = process.env.VIAERP_DIR;
            } else {
                console.error('Erro: Variável de ambiente de desenvolvimento "VIAERP_DIR" não configurada!');
                process.exit(0);
            }
        }

        console.log('Diretório do ViaERP Localizado: ', root_directory, '\n\n');
    } catch (e) {
        console.log(`Algo Falhou`);
        console.error(e);
    }
}