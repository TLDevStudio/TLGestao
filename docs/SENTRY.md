# Monitoramento de erros com Sentry — TLGestão

O Sentry avisa você (por e-mail ou painel web) quando algo quebra para um
usuário de verdade em produção — sem precisar que ele reclame.

## 1. Criar a conta (grátis)

1. Acesse [sentry.io](https://sentry.io) e crie uma conta gratuita (plano **Developer**).
2. Crie uma **Organização** (se pedir) e depois um **novo projeto**.
3. Na tela de escolha de plataforma, selecione **React**.
4. O Sentry vai te mostrar um **DSN** — uma URL parecida com:
   `https://abc123@o000000.ingest.us.sentry.io/000000`

## 2. Configurar no projeto

1. Abra (ou crie, se não existir) o arquivo `.env` na raiz do projeto.
2. Adicione a linha, colando o DSN que o Sentry te deu:

   ```
   VITE_SENTRY_DSN=https://abc123@o000000.ingest.us.sentry.io/000000
   ```

3. Instale a nova dependência:

   ```bash
   npm install
   ```

## 3. Testando se funcionou

O Sentry só ativa em **build de produção** (`npm run build` + `npm run preview`,
ou o site já publicado) — em `npm run dev` ele fica desligado de propósito,
para não gastar a cota gratuita com erros que só você vê enquanto codifica.

Para testar:

1. Rode `npm run build` e depois `npm run preview`.
2. Abra o site no navegador e force um erro proposital (ex.: no console do
   navegador, digite algo que quebre um componente, ou peça pra eu te
   preparar um botão de teste temporário).
3. Em alguns segundos, o erro deve aparecer no painel do Sentry
   (**Issues**, no menu lateral).

## 4. Limite do plano gratuito

O plano Developer do Sentry cobre **5.000 erros por mês**, o que é bem
confortável para o tamanho atual do TLGestão. Se um dia isso passar a ser
pouco (sinal de que o negócio cresceu bastante!), existe a opção de
migrar para um plano pago do próprio Sentry — não depende de mexer no
Firebase.
