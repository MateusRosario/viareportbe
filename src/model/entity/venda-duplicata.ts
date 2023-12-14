import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Venda } from "./Venda";
import { FormaPagamento } from "./FormaPagamento";

@Entity({ name: 'venda_duplicata' })
export class VendaDuplicata {
    @PrimaryGeneratedColumn()
    id: number;
    @JoinColumn({ name: 'id_venda', referencedColumnName: 'id' })
    @ManyToOne(() => Venda, v => v.id, { eager: true })
    idVenda: Venda;
    @Column({ name: 'id_empresa' })
    idEmpresa: number;
    @Column({ type: 'date' })
    data: Date;
    @Column()
    documento: string;
    @Column()
    parcela: string;
    @Column({ name: 'vl_total', type: 'float' })
    vlTotal: number;
    @Column({ name: 'vl_divida', type: 'numeric' })
    vlDivida: number;
    @JoinColumn({ name: 'id_forma', referencedColumnName: 'id' })
    @OneToOne(() => FormaPagamento, fp => fp.id, { eager: true })
    idForma: FormaPagamento;
}