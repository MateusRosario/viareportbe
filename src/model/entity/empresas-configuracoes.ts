import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresas } from "./empresas";

@Entity({name: "empresas_configuracoes"})
export class EmpresasConfiguracoes extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    img_relatorio: string;

    @OneToOne(() => Empresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa: Empresas;
}
