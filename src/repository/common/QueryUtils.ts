import { Between, ColumnTypeUndefinedError, Equal, EqualOperator, ILike } from "typeorm";
import { AppDataSource } from "../../data-source";
import { isValid } from "../../service/FunctionsServices";

export function BuidWhereByModel(model) {
  let retorno = {};

  AppDataSource.getMetadata(model.constructor.name).columns.forEach((element) => {

    let name = element.propertyName;
    let value = model[name];
    let _type = element.type;

     


    if (value !== undefined && value != null) {
      console.log(`Nome: ${name} \nValor: ${value} \nTipo: ${_type["name"]}`)      
      try {
        if (isValid(element.referencedColumn)) {
          retorno[name] = BuidWhereByModel(value);
        } else if (_type["name"] === "Date") {
            if (isValid(value["inicio"]) && isValid(value["fim"])) {
                retorno[name] = Between(value["inicio"], value["fim"]);
            } else {
                retorno[name] = Equal(value);
            }
          
        } else if (value instanceof String || typeof value === "string") {
          retorno[name] = ILike(value);
        } else {
          retorno[name] = Equal(value);
        }
      } catch (error) {}
    }
  });

  return retorno;
}
let o = {
  id: 555,
};
