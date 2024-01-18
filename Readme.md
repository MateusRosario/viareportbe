# Via Report

Serviço para gerar relatórios html que podem ser chamados por outras aplicações, abertos no navegador e impressos.

## versões

Projeto iniciado com npm 9.8.1 e node v18.18.2

Testando utilização do npm 10.2.3 e node v20.10.0

### Executar

Ambiente de Desenvolvimento:

```
npm run start-dev
```

### Deploy

- 1. Build da aplicação (gera exe):
```
npm run build
```

- 2. Comprime aplicação para arquivo ViaReport.zip

    - Estrutura:
        - (Folder) bin:
            - viareport.exe
        - WinSW-x64.xml:
            ```
            <service>
                <!--  ID of the service. It should be unique across the Windows system -->
                <id>ViaReport</id>
                <!--  Display name of the service  -->
                <name>Via Report</name>
                <!--  Service description  -->
                <description>Serviço de backend de relatórios</description>
                <!--  Path to the executable, which should be started  -->
                <executable>%BASE%\bin\viareport.exe</executable>
                <arguments>%BASE%</arguments>
                <logpath>%BASE%\Log</logpath>
            </service>
            ```

- 3. Gerar md5 do arquivo .zip - (pode utilizar script util md5.py)
- 4. Adicionar a nova atualização na tabela [ViaHelper][update_produtos]

### Referências de Dependências

Veja https://www.youtube.com/watch?v=j8cm2C5-xn8 p/ configurações gerais express e typeORM;

Veja https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications p/ o winton logger;