import express, { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import routes from './controller/common/routes';
import { httpException } from './model/exceptions/httpExceptions';
import { ErroHandle } from './config/log';
AppDataSource.initialize().then(() => {
    const app = express();
    const morgan = require('morgan');
    const winston = require('./config/log')

    app.use(express.json());
    app.use(morgan('combined', {stream: winston.stream}))

    app.use(function (err: httpException, req: Request, res: Response, next){
        ErroHandle(err,req,res,next);
    });

    app.get('/test', (req: Request, res: Response, next)=>{
        res.send("Em execução")
        
    })
    app.use(routes);

    return app.listen(8181);
}).catch(
    (err) => console.error(err)
);