import { Decimal } from 'decimal.js';
import { getDBConnection } from "../../services/data-config-services/db-connection.service";
import { somaVT } from '../../helpers/ArithmeticOperators';
import { isValid } from "../../services/FunctionsServices";

class test<T>{
    name: string;
    constructor(ex: new () => T){
        this.name = ex.name
    }
}

export class Page<T>{
    /**
     * @param Conteudo da pagina
     */
    content: T[];
    /**
     * @param Tamanho total dos dados na base de dados
     */
    length: number;
    /**
     * @param numero de itens por pagina obs pode ser maior que a quantidade de itens da pagina
     */
    size: number;
    /**
     * @param numero da pagina exemplo pagina = 5 (offset: pagina*size, limit: size)
     */
    number: number;
     /**
     * @param lengthContent número de registros no array content
     */
      contentLength: number;
    /**
     * @param direcao and fields
     */
    sort: {fields: string, dir: 'ASC' | 'DESC'};

    constructor() { }
    /**
     * @returns se a proxima pagina estiver dentro do range de paginas mossiveis retorna true;
     */
    public hasMorePages(): boolean {
        let temMaisPaginas = false;
        let paginaAtual = this.number;
        let totalDeRegistros = this.length;
        let registrosPorPagina = this.size;
        if (this.length > 0.00) {
            let quantidadeDePaginas = Decimal.div(new Decimal(totalDeRegistros), new Decimal(registrosPorPagina)).ceil().toNumber();
            temMaisPaginas = (paginaAtual < (quantidadeDePaginas - 1));
        }     

        // console.log(`\n=========================
        // let paginaAtual = ${this.number};
        // let totalDeRegistros = ${this.length};
        // let registrosPorPagina = ${this.size};
        // let quantidadeDePaginas = ${Decimal.div(new Decimal(totalDeRegistros), new Decimal(registrosPorPagina)).ceil().toNumber()}`)

        

        return temMaisPaginas;
    }
    /**
     * @returns uma nova pagina apenas se for possivel, caso não seja retorna a mesma pagina atual
     */
    public getNextPage<T>(): Page<T> {
        const retorno = Page.CreatePage<T>(this.size, this.number);
        if (this.hasMorePages() || this.length === 0) { // caso seja a primeira requisição e não foi calculado o tamanho ainda       
            this.number += 1;            
            retorno.length = this.length;
            retorno.size = this.size;
            retorno.number = this.number;
            retorno.sort = this.sort;
        }
        return retorno;
    }

    public getOffset(): number {
        if (isValid(this.size) && isValid(this.number)) {
            return this.size * this.number;
        }
        throw new Error('Pagina não criada ou não instaciada!');
    }

    /**
     * @param size tamanho da pagina default 50
     * @param number numero da pagina default 0
     * @returns pagina<S qualquer objeto possivel>
     */
    public static CreatePage<S>(size?: number, number?: number): Page<S>{
        if(!isValid(size)){
            size = 50;
        }
        if(!isValid(number)){
            number = 0;
        }
        const retorno = new Page<S>();
        retorno.length = 0;
        retorno.content = [];
        retorno.number = number;
        retorno.size = size;
       
        return retorno;
    }

    public createDefaultSort(model: T, cnpj: string):void {
        try{
            let aux = '';       
               
            let columns  = getDBConnection(cnpj).getMetadata(model.constructor.name).primaryColumns;
            for (let i = 0; i < columns.length; i++) {
                const element = columns[i];
                aux += element.propertyName+','
            }
            aux = aux.substring(0, aux.length-1);
            this.sort ={
                fields: aux,
                dir: 'ASC'
            }
        }catch  (err){
            console.error(err);
        }
    }
}
