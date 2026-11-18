# tf-skills

Instalador das tf-skills. O conteúdo vai cifrado em `bundle.enc` (AES-256-GCM, chave derivada por scrypt) e só é aberto com a senha.

```bash
npx -y tf-skills@latest
```

Alternativa direto do GitHub (precisa de `git`; o `--allow-git=all` é exigido pelo npm 12+):

```bash
npx -y --allow-git=all github:tiagosouzaf/tf-skills-installer
```

Requisitos: Node.js ≥ 18. Funciona em Linux, macOS, WSL e Windows. Para atualizar ou remover skills, rode o mesmo comando de novo.
Sem interação: defina `TF_SKILLS_SENHA` antes do comando.
