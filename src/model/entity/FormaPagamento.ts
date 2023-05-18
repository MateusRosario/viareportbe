import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "formas_pagamento" })
export class FormaPagamento extends BaseEntity {
  
  
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string;
  @Column()
  ativo: Boolean;
  @Column()
  condicao: string;
}
