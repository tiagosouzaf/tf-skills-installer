# tf-skills-installer

Instalador das tf-skills. O conteúdo vai cifrado em `bundle.enc` (AES-256-GCM, chave derivada por scrypt) e só é aberto com a senha.

```bash
npx -y github:tiagosouzaf/tf-skills-installer
```

Requisitos: Node.js ≥ 18 e git. Para atualizar ou remover skills, rode o mesmo comando de novo.
Sem interação: `TF_SKILLS_SENHA='...' npx -y github:tiagosouzaf/tf-skills-installer`.
