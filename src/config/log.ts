import { Request, Response } from "express";
import { httpException } from "../model/exceptions/httpExceptions";

const winston = require('winston');

var options = {
    file: {
        level: 'debug',
        filename: `${process.env.ViaERP_home}log/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 419430400,
        colorize: false
    },
    console:{
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    }
}

const Logger = winston.createLogger({
    transports:[
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false,
})

Logger.stream = {
    write: function(message: string, encoding: any){
        Logger.log({level: 'info', message: message})
    }
}

/** Exporting Logger criado */
export default Logger;