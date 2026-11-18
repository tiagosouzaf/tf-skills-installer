# tf-skills

Instalador das tf-skills. O conteúdo vai cifrado em `bundle.enc` (AES-256-GCM, chave derivada por scrypt) e só é aberto com a senha.

```bash
npx -y --allow-remote=all https://github.com/tiagosouzaf/tf-skills-installer/archive/refs/heads/main.tar.gz
```

Não precisa de `git`. O `--allow-remote=all` é exigido pelo npm 12+ e ignorado pelos anteriores.
Requisitos: Node.js ≥ 18. Funciona em Linux, macOS, WSL e Windows (PowerShell ou cmd).

A cada execução o instalador baixa a versão mais recente das skills, mesmo que o npx tenha guardado o pacote em cache.
Para atualizar ou remover skills, rode o mesmo comando de novo. Sem interação: defina `TF_SKILLS_SENHA` antes do comando.
