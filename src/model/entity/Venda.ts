import { DevolucaoVendaViewm } from './devolucao-venda-viewm';
import { FormaPagamento } from './FormaPagamento';
import { Cliente } from './Cliente';
import { Vendedor } from './Vendedor';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuarios } from './Usuarios';
import { VendaCanceladaViewm } from './venda-cancelada-viewm';
import { DateTimezoneTransformer } from '../apoio/date-timezone-transformer';
import { VendaItem } from './VendaItem';
import { NumericTransformer } from '../../services/FunctionsServices';

@Entity({ name: "venda" })
export class Venda extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  id_empresa: number;
  @Column({ type: "date", name: "data_emissao", transformer: new DateTimezoneTransformer() })
  data_emissao: Date;
  @Column()
  hora: string;
  @Column({ type: "date", name: "data_saida" })
  data_saida: Date;
  @Column()
  gerado: string;
  @ManyToOne(() => Cliente, (cliente) => cliente.id, { eager: true })
  @JoinColumn({ name: "id_cliente", referencedColumnName: "id" })
  id_cliente: Cliente;
  @ManyToOne(() => Vendedor, (vendedor) => vendedor.id, { eager: true })
  @JoinColumn({ name: "id_vendedor", referencedColumnName: "id" })
  id_vendedor: Vendedor;
  @ManyToOne(() => FormaPagamento, (forma) => forma.id, { eager: true })
  @JoinColumn({ name: "id_forma", referencedColumnName: "id" })
  id_forma: FormaPagamento;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_produto: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_servico: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_desconto: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_frete: number;
  @Column({ type: "decimal", transformer: NumericTransformer })
  vl_total: number;
  @Column()
  qtd_itens: number;
  @Column()
  cotacao: string;

  @ManyToOne(() => Usuarios, (usuario) => usuario.id, { eager: true })
  @JoinColumn({ name: "id_usuario", referencedColumnName: "id" })
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
  @Column({ type: "timestamp" })
  data_cancelamento: Date | { inicio: Date, fim: Date };
  @Column({ default: false })
  nf_uniao: boolean;

  @OneToMany(() => VendaItem, vi => vi.id_venda)
  itens: VendaItem[]

}
