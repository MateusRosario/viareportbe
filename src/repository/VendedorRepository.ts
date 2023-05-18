import { Vendedor } from "./../model/entity/Vendedor";
import { AppDataSource } from "./../data-source";

export const VendedorRepository = AppDataSource.getRepository(Vendedor);
