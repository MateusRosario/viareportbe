export class FuncoesService {

    constructor() { }
  
    public extrairPercentual(valor: number, total: number, precision: number): number {
      return parseFloat(((valor * 100) / total).toFixed(precision));
    }
  
    static extrairPercentual(valor: number, total: number, precision: number): number {
      return parseFloat(((valor * 100) / total).toFixed(precision));
    }
  
    public extrairValorDePercentual(percentual: number, total: number, precision: number): number {
      return parseFloat(((total * percentual) / 100).toFixed(precision));
    }
    static extrairValorDePercentual(percentual: number, total: number, precision: number): number {
      return parseFloat(((total * percentual) / 100).toFixed(precision));
    }
    /**
    * Retorna a soma exata sem os erros do ponto flutuante
    */
    static somar(num1: number, num2: number, decimalPresision: number): number {
      let numeroRetorno = 0;
  
      // verifica se os valores estão de acordo
      if (!num1) {
        num1 = 0;
      }
  
      if (!num2) {
        num2 = 0;
      }
  
      if (isNaN(num1)) {
        num1 = 0;
      }
  
      if (isNaN(num2)) {
        num2 = 0;
      }
      //fim das veficações
  
      //verifica se os numeros são negativos
      if (num1 < 0) {
        num1 = num1 * -1;
        numeroRetorno = (-1 * this.subtrair(num1, num2, decimalPresision));
      }
      if (num2 < 0) {
        num2 = num2 * -1;
        numeroRetorno = this.subtrair(num1, num2, decimalPresision);
      }
      //fim
  
  
      //Trunca os valores
      const numer1 = this.trunc10(num1, decimalPresision);
      const numer2 = this.trunc10(num2, decimalPresision);
  
      // faz split do valor das variaveis para trabalhar os numeros depois da vírgula como decimais
      const num1Complete = (numer1 + '').split('.');
      const num2Complete = (numer2 + '').split('.');
  
      // verifica se existe numero depois da vírgula e da valor se não
      if (!num1Complete[1]) {
        num1Complete[1] = '0';
      }
      if (!num2Complete[1]) {
        num2Complete[1] = '0';
      }
  
  
      let maior = 0;
      if (num1Complete[1].length > num2Complete[1].length) {
        maior = num1Complete[1].length;
      } else {
        maior = num2Complete[1].length;
      }
      //efetua a soma da parte inteira do numeto
      let integerPart = Number(num1Complete[0]).valueOf() + Number(num2Complete[0]).valueOf();
  
      //adiciona os zeros a direita da parte inteira
      const num1DecCorrigido = FuncoesService.colocaZero(num1Complete[1], maior, true, '0');
      const num2DecCorrigido = FuncoesService.colocaZero(num2Complete[1], maior, true, '0');
  
      //efetua a soma da parte decima do numero
      let decimalPart = Number(num1DecCorrigido).valueOf() + Number(num2DecCorrigido).valueOf();
  
      const decimalpartString = '' + decimalPart;
  
      //verifica se é necessário correr a vírgula para direita, somando mais 1 e removendo o primeiro numero do decimal
      if (decimalpartString.length > maior) {
        integerPart = integerPart + 1;
        decimalPart = Number(decimalpartString.slice(1, decimalpartString.length)).valueOf();
      }
  
      //converte extrai o resultado e retorna um inteiro
      const result = integerPart + '.' + FuncoesService.colocaZero(decimalPart, maior, false, '0');
      numeroRetorno = Number(result).valueOf();
  
  
      return numeroRetorno;
    }
  
  
    /**
    * Retorna a subtração exata sem os erros do ponto flutuante
    */
    static subtrair(num1: number, num2: number, decimalPresision: number): number {
      let numeroRetornoSub = 0;
      const tamanho = Math.abs(decimalPresision);
      // mesmas vaidações da soma
      if (!num1) {
        num1 = 0;
      }
      if (!num2) {
        num2 = 0;
      }
      if (isNaN(num1)) {
        num1 = 0;
      }
      if (isNaN(num2)) {
        num2 = 0;
      }
      if (num1 < 0) {
        num1 = num1 * -1;
        return (-1 * this.somar(num1, num2, decimalPresision));
      }
      if (num2 < 0) {
        num2 = num2 * -1;
        return this.somar(num1, num2, decimalPresision);
      }
  
  
      const numer1 = this.trunc10(num1, decimalPresision);
      const numer2 = this.trunc10(num2, decimalPresision);
  
      const num1Complete = (numer1 + '').split('.');
      const num2Complete = (numer2 + '').split('.');
  
  
      if (!num1Complete[1]) {
        num1Complete[1] = '0';
      }
      if (!num2Complete[1]) {
        num2Complete[1] = '0';
      }
  
      let maior = 0;
      if (num1Complete[1].length > num2Complete[1].length) {
        maior = num1Complete[1].length;
      } else {
        maior = num2Complete[1].length;
      }
      // fim das validações
  
      // tem que fazer isso pra retornar a parte fracionada com os zeros a esquerda corretamente
      let num1DecCorrigido = FuncoesService.colocaZero(num1Complete[1], maior, true, '0');
      const num2DecCorrigido = FuncoesService.colocaZero(num2Complete[1], maior, true, '0');
      let decimalPart = 0;
      let integerPart = 0;
      if ((Number(num2Complete[0]).valueOf() > Number(num1Complete[0]).valueOf())
        && ((Number(num1Complete[1]).valueOf() > 0) || (Number(num2Complete[1]).valueOf() > 0))) {
        const retorno = (-1 * this.subtrair(num2, num1, decimalPresision));
        // console.log(`%c--------------| resposta final ${num1} - ${num2} = ${retorno} `, 'color:blue');
        return retorno;
      }
  
      if (Number(num1DecCorrigido).valueOf() < Number(num2DecCorrigido).valueOf()
        && (Number(num1Complete[0]).valueOf() >= 1)
        && (Number(num1Complete[0]).valueOf() > Number(num2Complete[0]).valueOf())) {
        const numero1InteiroAUX = Number(num1Complete[0]).valueOf() - 1;
        num1Complete[0] = '' + numero1InteiroAUX;
        num1DecCorrigido = '1' + num1DecCorrigido;
      }
      if (num2 === 0) {
        numeroRetornoSub = Number(num1).valueOf();
      } else if (num1 === 0) {
        numeroRetornoSub = - Number(num2).valueOf();
      } else if ((!num1Complete[1] && num2Complete[1]) && (Number(num1Complete[0]).valueOf() > Number(num2Complete[0]).valueOf())) {
        integerPart = Number(num1Complete[0]).valueOf() - Number(num2Complete[0]).valueOf();
        const decimalpart = Math.pow(10, num2Complete[1].length) - Number(num2Complete[1]).valueOf();
        const decimalpartS = FuncoesService.colocaZero(decimalpart, maior, false, '0');
        numeroRetornoSub = Number(Math.abs(integerPart) + '.' + decimalpartS).valueOf();
      } else if ((num1Complete[1] && !num2Complete[1]) && (Number(num1Complete[0]).valueOf() < Number(num2Complete[0]).valueOf())) {
        integerPart = Number(num1Complete[0]).valueOf() - Number(num2Complete[0]).valueOf();
        const parteinteira = integerPart + 1;
        const decimalpart = Math.pow(10, num1Complete[1].length) - Number(num1Complete[1]).valueOf();
        numeroRetornoSub = -Number(Math.abs(parteinteira) + '.' + decimalpart).valueOf();
      } else if ((Number(num2Complete[0]).valueOf() > Number(num1Complete[0]).valueOf())
        && (Number(num2DecCorrigido).valueOf() > Number(num1DecCorrigido).valueOf())) {
        decimalPart = Number(num2DecCorrigido).valueOf() - Number(num1DecCorrigido).valueOf();
        integerPart = Number(num2Complete[0]).valueOf() - Number(num1Complete[0]).valueOf();
        const decimalPartStringlocal = FuncoesService.colocaZero(decimalPart, maior, false, '0');
        numeroRetornoSub = - Number(Math.abs(integerPart) + '.' + decimalPartStringlocal).valueOf();
      } else {
        integerPart = Number(num1Complete[0]).valueOf() - Number(num2Complete[0]).valueOf();
        if (!isNaN(Number(num1DecCorrigido).valueOf()) && !isNaN(Number(num2DecCorrigido).valueOf())) {
          decimalPart = Number(num1DecCorrigido).valueOf() - Number(num2DecCorrigido).valueOf();
        } else if (!isNaN(Number(num1DecCorrigido).valueOf())) {
          decimalPart = Number(num1DecCorrigido).valueOf();
        } else if (!isNaN(Number(num2DecCorrigido).valueOf())) {
          decimalPart = Number(num2DecCorrigido).valueOf();
        }
        let decimalPartString = FuncoesService.colocaZero(decimalPart, maior, false, '0');
        if (decimalPartString.includes('-')) {
          decimalPartString = decimalPartString.replace('-', '');
          decimalPartString = '-' + FuncoesService.colocaZero(decimalPartString, maior, false, '0');
        }
        if (integerPart < 0 && (Number(num1Complete[0]).valueOf() !== 0)) {
          numeroRetornoSub = - Number(Math.abs(integerPart) + '.' + decimalPartString).valueOf();
        } else if ((integerPart > 0) && (decimalPart < 0)) {
          const parteinteira = integerPart;
          numeroRetornoSub = Number(Math.abs(parteinteira) + '.' + decimalPartString).valueOf();
        } else if ((Number(num1Complete[0]).valueOf() > Number(num2Complete[0]).valueOf()) && (decimalPart > 0)) {
          numeroRetornoSub = Number(Math.abs(integerPart) + '.' + decimalPartString).valueOf();
        } else if (!integerPart || (integerPart === 0)) {
          if (decimalPartString.includes('-')) {
            const decimalNegativo = decimalPartString.replace('-', '');
            numeroRetornoSub = - Number(0 + '.' + decimalNegativo).valueOf();
          } else {
            numeroRetornoSub = Number(0 + '.' + decimalPartString).valueOf();
          }
        } else if (integerPart > 0) {
          if (decimalPartString.includes('-')) {
            const decimalNegativo = decimalPartString.replace('-', '');
            numeroRetornoSub = - Number(integerPart + '.' + decimalNegativo).valueOf();
          } else {
            numeroRetornoSub = Number(integerPart + '.' + decimalPartString).valueOf();
          }
        }
      }
      // console.log(`%c--------------| ${num1} - ${num2} = ${numeroRetornoSub} `, 'color:blue');
      return numeroRetornoSub;
    }
  
    static trunc10(value, exp) {
      return this.decimalAdjust('trunc', value, exp);
    }
  
    /**
  * Decimal adjustment of a number.
  * made by: Mozilla Foundation
  * find on: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil
  * @since 18/07/2018
  * @param 	type	The type of adjustment.
  * @param		value	The number.
  * @param		exp		The exponent (the 10 logarithm of the adjustment base).
  * @returns				The adjusted value.
  */
    static decimalAdjust(type: string, value, exp: number): number {
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
        return FuncoesService[type](value);
      }
      value = +value;
      exp = +exp;
      // If the value is not a number or the exp is not an integer...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
      }
      // Shift
      value = value.toString().split('e');
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
      // Shift back
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
  
    static colocaZero(Texto, TamanhoDesejado: number, AcrescentarADireita: boolean, CaracterAcrescentar: string): string {
      // function ColocaZero(Texto : WideString; TamanhoDesejado : integer;
      // AcrescentarADireita : boolean = true; CaracterAcrescentar : char ='') : WideString;
  
      if (!Texto) {
        Texto = '';
      }
  
      if (Texto instanceof String) {
        Texto = Texto.trim();
      }
      let QuantidadeAcrescentar = TamanhoDesejado - ('' + Texto).length;
      if (QuantidadeAcrescentar < 0) {
        QuantidadeAcrescentar = 0;
      }
      // StringOfChar for repetindo um caractere
      if (AcrescentarADireita) {
        Texto = Texto + CaracterAcrescentar.repeat(QuantidadeAcrescentar);
      } else {
        Texto = CaracterAcrescentar.repeat(QuantidadeAcrescentar) + Texto;
      }
      return Texto.toUpperCase();
    }
  
    CastStrToNumber(str: string): number {
      let vl = new Number(str.replace(',', '.'));
      if (isNaN(vl.valueOf())) {
        throw new Error('String passada não é um numero válido');
      }
      return vl.valueOf();
    }
  }
