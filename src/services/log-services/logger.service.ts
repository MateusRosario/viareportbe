const winston = require('winston');
const morgan = require("morgan");


const OPTIONS = {
    file: {
        level: 'debug',
        filename: `${process.env.viaERP_home || 'ViaReportDefaultLogs'}/modulos/ViaReport/report-logs/app.log`,
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

class LoggerService {
    private _logger;
    public stream;

    constructor() {
        this._logger = winston.createLogger({
            transports:[
                new winston.transports.File(OPTIONS.file),
                new winston.transports.Console(OPTIONS.console)
            ],
            exitOnError: false,
        });

        this.stream = {
            write: (message: string, encoding: any) => {
                this._logger.error(message);
            }
        }
    }

    log(... message) {
        console.log(... message);

        this._logger.log({
            level: 'debug',
            message: message.join('  '),
        })
    }

    file(... message) {
        this._logger.log({
            level: 'debug',
            message: message.join('  '),
        })
    }

    httpLogger() {
        return morgan("combined", { stream: this.stream });
    }
}

var loggerServiceSingleton: LoggerService;

export default function logService() {
    if(loggerServiceSingleton == undefined) {
        loggerServiceSingleton = new LoggerService();
    }

    return loggerServiceSingleton;
}