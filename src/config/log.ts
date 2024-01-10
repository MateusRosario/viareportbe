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

const logger = winston.createLogger({
    transports:[
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false,
})

logger.stream = {
    write: function(message: string, encoding: any){
        logger.error(message)
    }
}

module.exports = logger;

/**
 * @param err httpException(status: number, message)
 * @param req Request
 * @param res Response
 * 
 * @description usar o metodo next(Função void que acompanha as requisições) em todas as classes controllers para efetuar o método do handler!
 */
export function ErroHandle(err: httpException, req: Request, res: Response, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500);
    res.render('error');
}