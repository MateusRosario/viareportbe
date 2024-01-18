import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { EmpresasConfiguracoes } from "./empresas-configuracoes";

@Entity({name: "empresas"})
export class Empresas extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    cnpj: string;
    @Column()
    inscricao_estadual: string;
    @Column()
    nome: string;
    @Column()
    razao_social: string;
    @Column()
    endereco: string;
    @Column()
    cep: string;
    @Column()
    bairro: string;
    @Column()
    cidade: string;
    @Column()
    uf: string;
    @Column({name: 'fone1'})
    fone: string;
    @OneToOne(() => EmpresasConfiguracoes, (EmpresasConfiguracoes) => EmpresasConfiguracoes.empresa)
    empresaConfiguracoes: EmpresasConfiguracoes;
}