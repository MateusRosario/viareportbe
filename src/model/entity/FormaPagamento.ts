import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum FormaPagamentoCondicaoEnum{
  AVISTA ='AVISTA',
  APRAZO ='APRAZO',
  CRED   ='CRED'
}

@Entity({ name: "formas_pagamento" })
export class FormaPagamento extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string;
  @Column()
  ativo: Boolean;
  @Column({enum: FormaPagamentoCondicaoEnum})
  condicao: FormaPagamentoCondicaoEnum;
}
