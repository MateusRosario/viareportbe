import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "vendedor"})
export class Vendedor extends BaseEntity {
 
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string; 
  @Column({type: "numeric"})
  comissao_avista: number;
  @Column({type: "numeric"})
  comissao_aprazo: number;
  @Column({type: "numeric"})
  comissao_servico: number; 
  @Column()
  ativo: string;
  @Column({type: "numeric"})
  comissao_financeiro: number;

}
