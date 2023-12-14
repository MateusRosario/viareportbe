import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({name: "empresas"})
export class Empresas extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    cnpj: string;
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
    fone: string
}