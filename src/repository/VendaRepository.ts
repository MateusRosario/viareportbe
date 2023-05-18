import { Venda } from './../model/entity/Venda';
import { AppDataSource } from './../data-source';

export const VendaRepository  = AppDataSource.getRepository(Venda);
