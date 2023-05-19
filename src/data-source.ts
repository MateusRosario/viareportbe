import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "ViaERP",
    password: "Via7216",
    database: "01351",
    synchronize: false,
    logging: true,
    entities: [`${__dirname}/**/model/entity/*.{ts, js}`],
    migrationsRun: false,
    subscribers: [],    
})


