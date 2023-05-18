import { VendaItem } from './../model/entity/VendaItem';
import { AppDataSource } from './../data-source';

export const VendaItemRepository = AppDataSource.getRepository(VendaItem);