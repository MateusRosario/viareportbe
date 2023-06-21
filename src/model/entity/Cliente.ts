import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'clientes'})
export class Cliente extends BaseEntity {  
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string;
  @Column()
  razao_social: string;
  @Column()
  cnpj: string;
  @Column()
  inscricao_estadual: string;
  @Column()
  cpf: string;
  @Column()
  ativo: string;
}
