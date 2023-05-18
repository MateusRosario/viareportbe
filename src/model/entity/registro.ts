import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, QueryBuilder } from "typeorm";

@Entity({synchronize: false}) //!!!!! observe bem essa variavel sem ela o TypeORM vai tentar atualizar sempre o banco automaticamente cuidado!
export class registro extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    id_cliente: number;
    @Column({nullable: true})//!!! o defaut do TypeORM é true cuidado!
    contato: string;
    @Column()
    data_instalacao: Date;
    @Column()
    data_mensal: Date;
    @Column()
    mensagemid: string;
    @Column()
    mensagempublic: string;
    @Column()
    sendmid: number;
    @Column()
    sendmpublic: number;
    @Column()
    code: string;
    @Column()
    serie: string;
    @Column()
    parceiro: string;
    @Column()
    produto: number;
    @Column()
    bloqueio: number;
    @Column()
    hash: string;

    constructor() {
        super()
    }
}