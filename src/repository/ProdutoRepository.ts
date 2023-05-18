import { Produto } from "./../model/entity/Produto";
import { AppDataSource } from "../data-source";

export const ProdutoRepository = AppDataSource.getRepository(Produto);
