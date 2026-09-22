# Backup manual do Firestore — TLGestão

Este guia explica como tirar um "retrato" completo do banco de dados sempre
que você quiser, **sem custo nenhum** (não exige o plano Blaze do Firebase).

## 1. Gerar a chave de acesso (só precisa fazer uma vez)

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e abra o projeto do TLGestão.
2. Clique na engrenagem ⚙️ ao lado de "Visão geral do projeto" → **Configurações do projeto**.
3. Vá na aba **Contas de serviço**.
4. Clique em **Gerar nova chave privada** → confirme.
5. Um arquivo `.json` será baixado (algo como `app-gestao-31ed4-firebase-adminsdk-xxxxx.json`).
6. Renomeie esse arquivo para **`serviceAccountKey.json`** e coloque na **raiz do projeto** (mesma pasta onde fica o `package.json`).

⚠️ **Esse arquivo dá acesso total ao seu banco de dados.** Nunca envie ele
para o GitHub, WhatsApp ou e-mail sem criptografia. O `.gitignore` já foi
atualizado para impedir que ele suba para o repositório sem querer — mas
confira sempre antes de dar `git push`.

## 2. Instalar as novas dependências

No terminal, dentro da pasta do projeto:

```bash
npm install
```

Isso vai instalar o `firebase-admin`, usado só para o backup (não afeta o site publicado).

## 3. Rodar o backup

Sempre que quiser fazer um backup, rode:

```bash
npm run backup
```

Você vai ver uma saída assim:

```
📦 Iniciando backup do Firestore em: backups/2026-09-22_14-30

  ✔ businesses: 3 documento(s)
  ✔ clients: 128 documento(s)
  ✔ services: 12 documento(s)
  ...

✅ Backup concluído! 245 documentos salvos em backups/2026-09-22_14-30
```

Cada backup fica salvo numa pasta com data e hora, dentro de `backups/`,
com um arquivo `.json` por coleção (clientes, vendas, produtos, etc.).

## 4. Guardar o backup em local seguro

A pasta `backups/` fica só no seu computador (ela está no `.gitignore`,
não vai para o GitHub). Depois de rodar o backup, é uma boa prática:

- Copiar a pasta gerada para o Google Drive, Dropbox ou um HD externo.
- Fazer isso **antes de mudanças grandes** no sistema (ex.: antes de importar
  uma planilha grande de clientes) e **periodicamente** (ex.: uma vez por mês).

## 5. Quando migrar para backup automático

Quando o negócio crescer e fizer sentido investir um pouco (Firebase no
plano Blaze, que cobra só pelo uso excedente da franquia gratuita), dá para
automatizar esse processo com Cloud Functions agendadas, sem precisar rodar
nada manualmente. Isso fica marcado como melhoria futura — não é necessário
agora.
