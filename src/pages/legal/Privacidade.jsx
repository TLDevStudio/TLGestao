import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout";

const RESPONSAVEL = "[Thiago Lemos]"
const CONTATO_EMAIL = "thiagodelemosferreira@gmail.com";
const CONTATO_WHATSAPP = "(21) 97593-0204";

export default function Privacidade() {
    return (
        <LegalLayout title="Política de Privacidade" updatedAt="[22/09/2026]">
            <LegalSection id="introducao" title="1. Introdução">
                <p>
                    Esta Política de Privacidade explica como o TLGestão coleta, usa, armazena e
                    protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados
                    (LGPD — Lei nº 13.709/2018).
                </p>
            </LegalSection>

            <LegalSection id="papeis" title="2. Dois tipos de dados pessoais tratados">
                <p>
                    É importante diferenciar dois grupos de dados dentro do TLGestão, porque a LGPD
                    trata cada um de forma diferente:
                </p>
                <ul>
                    <li>
                        <strong>Seus dados como usuário da conta</strong> (nome, e-mail, senha e dados
                        do seu negócio): aqui, o TLGestão atua como <strong>controlador</strong>,
                        definindo como e por que esses dados são tratados.
                    </li>
                    <li>
                        <strong>Dados dos seus clientes</strong>, que você mesmo cadastra no sistema
                        (nome, WhatsApp, e-mail, CPF): aqui, <strong>você é o controlador</strong> desses
                        dados perante seus clientes, e o TLGestão atua apenas como{" "}
                        <strong>operador</strong> — ou seja, tratamos esses dados seguindo suas
                        instruções, apenas para fazer o sistema funcionar (armazenar, exibir, permitir
                        buscas etc.), sem uso próprio para outras finalidades.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="dados-coletados" title="3. Quais dados coletamos">
                <p>
                    <strong>Da sua conta de usuário:</strong> nome, e-mail, senha (armazenada de forma
                    criptografada pelo Firebase Authentication) e dados básicos do seu negócio
                    (nome do negócio, tipo de negócio).
                </p>
                <p>
                    <strong>Dos clientes que você cadastra:</strong> nome, WhatsApp, e-mail e CPF —
                    apenas os campos que você optar por preencher.
                </p>
                <p>
                    <strong>Dados de uso:</strong> registros técnicos básicos de acesso e atividade
                    dentro do sistema (ex.: histórico de ações), usados para segurança e para o
                    funcionamento de funcionalidades como o histórico de atividades.
                </p>
            </LegalSection>

            <LegalSection id="finalidade" title="4. Para que usamos os dados">
                <ul>
                    <li>Viabilizar o funcionamento do sistema (login, cadastro, agenda, vendas etc.);</li>
                    <li>Autenticar e proteger o acesso à sua conta;</li>
                    <li>Dar suporte quando solicitado;</li>
                    <li>Cumprir obrigações legais, quando aplicável.</li>
                </ul>
                <p>Não vendemos nem alugamos dados pessoais a terceiros.</p>
            </LegalSection>

            <LegalSection id="base-legal" title="5. Base legal (LGPD)">
                <p>Tratamos dados com base, principalmente, em:</p>
                <ul>
                    <li>
                        <strong>Execução de contrato</strong> (art. 7º, V): para fornecer o serviço que
                        você contratou ao criar sua conta;
                    </li>
                    <li>
                        <strong>Legítimo interesse</strong> (art. 7º, IX): para segurança, prevenção a
                        fraudes e melhoria do sistema;
                    </li>
                    <li>
                        <strong>Cumprimento de obrigação legal</strong> (art. 7º, II), quando aplicável.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="compartilhamento" title="6. Compartilhamento de dados">
                <p>
                    Utilizamos os seguintes fornecedores (operadores) para viabilizar o TLGestão, que
                    processam dados em nosso nome, seguindo nossas instruções:
                </p>
                <ul>
                    <li>
                        <strong>Google Firebase</strong> (Authentication e Firestore) — armazenamento de
                        dados e autenticação de usuários;
                    </li>
                    <li>
                        <strong>GitHub Pages</strong> — hospedagem do site/aplicativo.
                    </li>
                </ul>
                <p>
                    Não compartilhamos dados pessoais com terceiros para fins de marketing ou
                    publicidade.
                </p>
            </LegalSection>

            <LegalSection id="seguranca" title="7. Armazenamento e segurança">
                <p>
                    Os dados ficam armazenados no Google Firestore, protegidos por regras de segurança
                    que garantem que cada conta só acesse os próprios dados, e por autenticação via
                    Firebase Authentication. A comunicação entre seu navegador e nossos servidores é
                    criptografada (HTTPS).
                </p>
                <p>
                    Apesar dos cuidados técnicos adotados, nenhum sistema é 100% livre de riscos. Caso
                    identifiquemos um incidente de segurança relevante, tomaremos as medidas cabíveis e
                    comunicaremos conforme exigido pela LGPD.
                </p>
            </LegalSection>

            <LegalSection id="retencao" title="8. Por quanto tempo guardamos os dados">
                <p>
                    Mantemos os dados enquanto sua conta estiver ativa. Caso solicite o encerramento da
                    conta e a exclusão dos dados, faremos isso dentro de um prazo razoável, salvo
                    quando houver obrigação legal de retenção por período diferente.
                </p>
            </LegalSection>

            <LegalSection id="direitos" title="9. Seus direitos como titular de dados">
                <p>Conforme o art. 18 da LGPD, você tem direito a:</p>
                <ul>
                    <li>Confirmar a existência de tratamento de dados;</li>
                    <li>Acessar seus dados;</li>
                    <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                    <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                    <li>Solicitar a portabilidade dos dados;</li>
                    <li>Solicitar a eliminação dos dados tratados com seu consentimento;</li>
                    <li>Obter informações sobre com quem compartilhamos seus dados;</li>
                    <li>Revogar o consentimento, quando aplicável.</li>
                </ul>
                <p>
                    Se você é cliente de um negócio que usa o TLGestão (ou seja, seus dados foram
                    cadastrados por outra pessoa) e quer exercer algum desses direitos, entre em
                    contato diretamente com o negócio em questão, que é o responsável (controlador)
                    pelos seus dados. Se preferir, também pode nos contatar e faremos a intermediação.
                </p>
            </LegalSection>

            <LegalSection id="cookies" title="10. Cookies e armazenamento local">
                <p>
                    O TLGestão utiliza apenas o armazenamento local do navegador estritamente
                    necessário para manter você conectado (sessão de autenticação). Não utilizamos
                    cookies de rastreamento ou publicidade.
                </p>
            </LegalSection>

            <LegalSection id="alteracoes" title="11. Alterações nesta política">
                <p>
                    Esta política pode ser atualizada periodicamente. Alterações relevantes serão
                    comunicadas por um aviso na plataforma. Recomendamos revisar esta página
                    periodicamente.
                </p>
            </LegalSection>

            <LegalSection id="contato" title="12. Contato">
                <p>
                    Para exercer seus direitos, tirar dúvidas ou relatar um incidente relacionado a
                    dados pessoais, entre em contato com <strong>{RESPONSAVEL}</strong>, responsável
                    pelo TLGestão:
                </p>
                <ul>
                    <li>
                        E-mail: <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a>
                    </li>
                    <li>WhatsApp: {CONTATO_WHATSAPP}</li>
                </ul>
            </LegalSection>
        </LegalLayout>
    );
}
