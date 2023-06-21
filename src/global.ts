const nodeDiskInfo = require('node-disk-info')
const path = require("path");
import { readdirSync } from 'fs'

export var root_directory = __dirname;

const hasViaERPDirectory = source => {
   const result = readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.toLowerCase() === "viaerp")
    .map(dirent => dirent.name);

    return (result.length === 1);
}



export function encontrarDiretorioViaERP() {
    try {
        const disks = nodeDiskInfo.getDiskInfoSync();
        
        for(let i = 0; i < disks.length; i++) {
            if (hasViaERPDirectory(disks[i].mounted  +  path.sep )){
                root_directory = disks[i].mounted  +  path.sep + "ViaERP" + path.sep + "Modulos" + path.sep + "ViaReport";
                console.log("ACHOU O DIRETÓRIO DO VIAERP: ", root_directory);
                break
               }      
        }
       
    } catch (e) {
        console.error(e);
    }
}

// function printResults(title, disks) {

//     console.log(`============ ${title} ==============\n`);

//     for (const disk of disks) {
//         console.log('Filesystem:', disk.filesystem);
//         console.log('Blocks:', disk.blocks);
//         console.log('Used:', disk.used);
//         console.log('Available:', disk.available);
//         console.log('Capacity:', disk.capacity);
//         console.log('Mounted:', disk.mounted, '\n');
//     }

// }