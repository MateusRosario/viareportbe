import { Page as Page } from './../model/apoio/page';
import { BaseEntity, Repository } from "typeorm";
import { BuidWhereByModel } from '../repository/common/QueryUtils';
import { isValid } from './FunctionsServices';
import { getConnection } from '../data-source';
/**
 * @param S repositorio do banco de dados
 * @param T entidade a qual refere-se o repositório
 * @throws erro caso não exista repositório
 */
export class PageService<T>{
    private repository: Repository<T>;
    constructor(private model: T, private cnpj: string){
        this.repository = getConnection(this.cnpj).getRepository(this.model.constructor.name);             
    }

    public async findByExemple(example: T, page?: Page<T>): Promise<Page<T>>{
        if(isValid(page)){
            if(! isValid(page.sort)){
                page.createDefaultSort(this.model);
            }
            if(!isValid(page.length) || page.length == 0){
                const ret = await this.repository.findAndCount({where: BuidWhereByModel(this.repository.create(example)), skip: page.getOffset(), take: page.size, 
                    order: this.getOrder(page)});
                page.content = ret[0];
                page.length = ret[1];
        
                return page;
            }
            
            page.content = await this.repository.find({where:BuidWhereByModel(this.repository.create(example)), skip: page.getOffset(), take: page.size, order: this.getOrder(page)});
            return page;
        }
        page = Page.CreatePage();
        page.createDefaultSort(this.model)
        const ret = await this.repository.findAndCount({where:BuidWhereByModel(this.repository.create(example)), skip: page.getOffset(), take: page.size, order: this.getOrder(page)});
        page.content = ret[0];
        page.length = ret[1];

        return page;
    }

    public async findByQuery(query: string, countQuery: string, page?: Page<T>): Promise<Page<T>>{
        let off='offset 0 limit 50';     
    
        if(isValid(page)){
            off = `offset ${page.getOffset()} limit ${page.size}`;
            if(isValid(page.sort)){
                page.createDefaultSort(this.model);
            }           
        }else{
            page = Page.CreatePage<T>();
            page.createDefaultSort(this.model);
            page.length = await this.repository.query(countQuery).then((c: {count: number}[]) => {
                return (c[0])['count'];
            }).catch(err=>{throw err})
        }        
        let order = page.sort.fields && page.sort.dir ? `order by ${page.sort.fields} ${page.sort.dir}`: '';
        page.content = await this.repository.query(`${query} ${order} ${off}`).then((v: T[]) => {
            return v;
        }).catch(err=>{throw err});

        return page;           
    }


    
    private getOrder(page: Page<T>){
        let el = {};
        for (let i = 0; i < page.sort.fields.split(',').length; i++) {
            const element = page.sort.fields.split(',')[i];
            el[element] = page.sort.dir;
        }

        return el;
    }
}