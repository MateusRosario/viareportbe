import { AppDataSource } from "../data-source";
import { registro } from "../model/entity/registro";

export const RegistroRepository = AppDataSource.getRepository(registro)