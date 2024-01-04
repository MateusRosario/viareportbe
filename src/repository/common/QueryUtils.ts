import { Between, ColumnTypeUndefinedError, Equal, EqualOperator, ILike } from "typeorm";
import { getDBConnection } from "../../services/data-config-services/db-connection.service";
import { isValid } from "../../services/FunctionsServices";

export function BuidWhereByModel(model, cnpj: string) {
  let retorno = {};  
  const conn = getDBConnection(cnpj);
  conn.getMetadata(model.constructor.name).columns.forEach((element) => {
    let name = element.propertyName;
    let value = model[name];
    let _type = element.type; 

    if (value !== undefined && value != null) {
      // console.log(`===> \nNome: ${name} \nValor: ${JSON.stringify(value)} \nTipo: ${_type["name"]} \n======`)      
      try {
        if (isValid(element.referencedColumn)) {
          retorno[name] = BuidWhereByModel(value, cnpj);
        } else if ((_type["name"] === "Date") || (isValid(value["inicio"]) && isValid(value["fim"])) ) {
            if (isValid(value["inicio"]) && isValid(value["fim"])) {
                retorno[name] = Between(value["inicio"], value["fim"]);
                // console.log(retorno[name]);
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
