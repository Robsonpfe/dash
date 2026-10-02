# Como Rodar o TechOps Triângulo Localmente com Link Público para Apresentação

Siga este passo a passo para rodar o sistema no seu computador e gerar um link público com HTTPS para abrir no celular ou compartilhar com a diretoria/equipe.

---

## Passo 1: Rodar o projeto no seu computador

### Pré-requisito:
- Ter o **Node.js** (versão 20 ou superior) instalado no computador ([nodejs.org](https://nodejs.org/)).

### No Terminal / PowerShell / Prompt de Comando:
1. Abra a pasta do projeto:
   ```bash
   cd techops-triangulo
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o sistema:
   ```bash
   npm run dev
   ```

4. Acesse no seu navegador:
   👉 **http://localhost:3000**

---

## Passo 2: Gerar um Link Público com HTTPS para Apresentar

Com o `npm run dev` rodando no primeiro terminal, abra uma **segunda janela de terminal** e escolha uma das opções abaixo:

### Opção 1: Cloudflare Tunnel (Mais estável e 100% Grátis - Sem cadastro)
A Cloudflare permite criar um link público seguro instantaneamente sem precisar criar conta:

- **Se você tiver o `cloudflared` instalado:**
  ```bash
  cloudflared tunnel --url http://localhost:3000
  ```

Ele gerará uma URL como:
`https://random-words.trycloudflare.com`

---

### Opção 2: LocalTunnel (Sem instalar nada - roda direto via NPX)
Esta é a opção mais rápida se você não quiser instalar nenhum software extra:

```bash
npx localtunnel --port 3000
```

Ele gerará na hora uma URL pública como:
`https://clean-dogs-jump.loca.lt`

> **Dica ao abrir o link:** Na primeira vez que abrir no navegador, o LocalTunnel pede para confirmar o IP público da sua máquina (basta clicar no botão azul "Click to Continue" ou colar o IP fornecido).

---

### Opção 3: Ngrok (Muito popular e confiável)
1. Instale o ngrok ou use via npx:
   ```bash
   npx @ngrok/ngrok http 3000
   ```
2. Ele fornecerá a URL pública com HTTPS pronta para ser acessada de qualquer smartphone ou rede externa.
