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

    /**
     * @returns imagem da empresa para relatórios 
     * no formato base64
     */
    getImgRelatorioAsBase64(): string {
        const img = Buffer.from(this.img_relatorio, 'binary').toString('base64');
        return 'data:image/jpg;base64,' + img;
    }
}
