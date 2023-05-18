import Decimal from "decimal.js";

export function somaVT(values: number[], decimalPlaces: number = 2): number {
  let retorno = new Decimal(0);

  values.forEach((value) => {
    retorno = retorno.plus(value);
  });

  return retorno.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN).toNumber();
}

export function multiplicarVT(values: number[], decimalPlaces: number = 2): number {
  let retorno = new Decimal(1);

  values.forEach((value) => {
    retorno = retorno.mul(value);
  });

  return retorno.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN).toNumber();
}

export function subtrairVT(A: number, B: number, decimalPlaces: number = 2) {
  let retorno = Decimal.sub(A, B);

  return retorno.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN).toNumber();
}
