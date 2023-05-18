import { FormaPagamento } from './FormaPagamento';
import { Cliente } from './Cliente';
import { Vendedor } from './Vendedor';
import { ByteLengthQueuingStrategy } from "stream/web";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Usuarios } from './Usuarios';

@Entity({name: "venda"})
export class Venda extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  id_empresa: number;
  @Column()
  data_emissao: Date;
  @Column()
  hora: string;
  @Column()
  data_saida: Date;
  @Column()
  gerado: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.id, {eager: true})
  @JoinColumn({name: "id_cliente", referencedColumnName: "id"})
  id_cliente: Cliente;

  @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, {eager: true})
  @JoinColumn({name: "id_vendedor", referencedColumnName: "id"})
  id_vendedor: Vendedor;

  @ManyToOne(() => FormaPagamento, (forma) => forma.id, {eager: true})
  @JoinColumn({name: "id_forma", referencedColumnName: "id"})
  id_forma: FormaPagamento;

  @Column({type: "numeric"})
  vl_produto: number;
  @Column({type: "numeric"})
  vl_servico: number;
  @Column({type: "numeric"})
  vl_desconto: number;
  @Column({type: "numeric"})
  vl_frete: number;
  @Column({type: "numeric"})
  vl_total: number;
  @Column()
  qtd_itens: number;
  @Column()
  cotacao: string;

  @ManyToOne(() => Usuarios, (usuario) => usuario.id, {eager: true})
  @JoinColumn({name: "id_usuario", referencedColumnName: "id"})
  id_usuario: Usuarios;

  @Column()
  devolucao: string;
  @Column()
  cancelada: string;
  @Column()
  expedicao: string;
  @Column()
  reativacao: Boolean;
  @Column()
  romaneio: string;
  @Column()
  data_cancelamento: Date;

}
