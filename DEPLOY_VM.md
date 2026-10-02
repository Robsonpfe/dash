# Guia de Implantação em Máquina Virtual (VM) - TechOps Triângulo

Este aplicativo foi desenvolvido para rodar com alta performance e baixo consumo de recursos em qualquer Máquina Virtual (Ubuntu, Debian, CentOS, AWS EC2, Google Cloud Compute Engine, Azure VM ou Proxmox local).

---

## Opção 1: Executando com Docker & Docker Compose (Mais Rápido e Seguro)

Se a sua VM já possui o Docker instalado:

1. **Baixe ou transfira o projeto para a sua VM**:
   ```bash
   git clone <URL_DO_REPOSITORIO> techops-triangulo
   cd techops-triangulo
   ```

2. **Inicie o container em segundo plano**:
   ```bash
   docker compose up -d --build
   ```

3. **Pronto!** O TechOps Triângulo estará rodando na porta `3000`.
   Acesse via navegador ou celular pelo IP da sua VM:
   ```text
   http://IP_DA_SUA_VM:3000
   ```

---

## Opção 2: Executando Diretamente com Node.js & PM2 (Sem Docker)

Se preferir rodar nativamente com Node.js:

1. **Instale o Node.js 20+ ou 22+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Instale as dependências e faça o build**:
   ```bash
   cd techops-triangulo
   npm install
   npm run build
   ```

3. **Inicie com o PM2 (Gerenciador de Processos para manter rodando após reinicializações)**:
   ```bash
   sudo npm install -g pm2
   pm2 start "npm start" --name techops-triangulo
   pm2 save
   pm2 startup
   ```

---

## Configuração de Acesso Externo & Domínio com Nginx e SSL (HTTPS)

Para acessar com um domínio próprio (ex: `suporte.grupotrapezio.com.br`) com certificado SSL gratuito:

1. **Instale o Nginx e Certbot**:
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Configure o Nginx** em `/etc/nginx/sites-available/techops`:
   ```nginx
   server {
       server_name suporte.grupotrapezio.com.br;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Ative o site e gere o certificado HTTPS**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/techops /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d suporte.grupotrapezio.com.br
   ```

---

## Variáveis de Ambiente Suportadas

- `PORT`: Porta de escuta (padrão: `3000`).
- `MOVIDESK_API_KEY`: Token de API do Movidesk (já pré-configurado com a chave fornecida).
- `NODE_ENV`: Modo de execução (`production`).
