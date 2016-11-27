# projeto-exame-ces35
Projeto Exame dos alunos Mattheus Martins Jucá e José de Oliveira Lima Neto na Disciplina de CES-35 - Redes de Computadores ministrada pela Profª. Cecília de Azevedo Castro César no Instituto Tecnológico de Aeronáutica.

## Informações Gerais:

O bloco a seguir indica que um comando deve ser executado na linha de comando:
```shell
folder$ node --version
```
> v6.9.1

**folder** é a pasta onde o comando deve ser executado. Caso esteja vazio, o comando deve ser executado na pasta raiz do projeto (projeto-exame-ces35).  
**$** indica o começo do comando a ser executado.  
**v6.9.1** é a saída no console.

### Rodando o servidor

Para rodar o servidor, execute o comando abaixo:
```shell
$ node index
```
> listening on *: 3000
> Connected users: 0

Agora, basta abrir o navegador e acessar localhost:3000 para utilizar a aplicação.

### Clientes em vários computadores

Para rodar a aplicação em vários computadores a partir de uma rede local abra um novo terminal do prompt de comando e execute:
```shell
$ netsh wlan set hostednetwork mode=allow ssid=RedeDoChat key=password
$ netsh wlan start hostednetwork
```

Agora conecte o novo computador na rede criada e acesse IPdoServidor:3000 no navegador. Onde IPdoServidor deve ser substituido pelo IP do computador que está rodando o servidor na rede local. Para decobrí-lo execute o comando abaixo e pegue o endereço IPv4 do Adaptador de Rede sem Fio Conexão Local.
```shell
$ ipconfig
```