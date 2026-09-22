import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout";

const RESPONSAVEL = "[Thiago de Lemos Ferreira]";
const CONTATO_EMAIL = "[thiagodelemosferreira@gmail.com]";
const FORO = "[Nova Iguaçu/RJ]";

export default function Termos() {
    return (
        <LegalLayout title="Termos de Uso" updatedAt="[22/09/2026]">
            <LegalSection id="aceitacao" title="1. Aceitação dos termos">
                <p>
                    Ao criar uma conta ou utilizar o TLGestão, você concorda integralmente com estes
                    Termos de Uso. Se você não concordar com algum ponto, não deve utilizar a
                    plataforma.
                </p>
            </LegalSection>

            <LegalSection id="descricao" title="2. Descrição do serviço">
                <p>
                    O TLGestão é uma plataforma de gestão para pequenos negócios (barbearias, salões
                    de beleza, oficinas, lojas e prestadores de serviço em geral), que permite
                    controlar clientes, agendamentos, estoque, vendas e financeiro.
                </p>
                <p>
                    O serviço é oferecido "como está" ("as is"), podendo passar por atualizações,
                    manutenções e mudanças de funcionalidades a qualquer momento, sem aviso prévio.
                </p>
            </LegalSection>

            <LegalSection id="cadastro" title="3. Cadastro e liberação de acesso">
                <ul>
                    <li>Para usar o TLGestão, é necessário criar uma conta com dados verdadeiros.</li>
                    <li>
                        Você é responsável por manter sua senha em sigilo e por todas as atividades
                        realizadas na sua conta.
                    </li>
                    <li>
                        O acesso completo a algumas contas pode depender de uma etapa de liberação
                        manual, conforme indicado dentro do próprio sistema.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="dados-inseridos" title="4. Dados que você insere na plataforma">
                <p>
                    Ao usar o TLGestão, você poderá cadastrar dados de terceiros (por exemplo, nome,
                    telefone/WhatsApp, e-mail e CPF de seus próprios clientes). Ao fazer isso, você
                    declara que:
                </p>
                <ul>
                    <li>Possui base legal e autorização para tratar esses dados;</li>
                    <li>
                        É o responsável (controlador, nos termos da LGPD) por esses dados perante os
                        seus clientes;
                    </li>
                    <li>
                        Utilizará o sistema apenas para finalidades lícitas relacionadas à gestão do seu
                        próprio negócio.
                    </li>
                </ul>
                <p>
                    Mais detalhes sobre como tratamos esses dados estão na{" "}
                    <a href="/privacidade">Política de Privacidade</a>.
                </p>
            </LegalSection>

            <LegalSection id="uso-aceitavel" title="5. Uso aceitável">
                <p>Ao usar o TLGestão, você concorda em não:</p>
                <ul>
                    <li>Utilizar a plataforma para fins ilícitos ou fraudulentos;</li>
                    <li>Tentar acessar contas, dados ou áreas administrativas de terceiros;</li>
                    <li>Tentar comprometer a segurança ou o funcionamento do sistema;</li>
                    <li>
                        Copiar, revender ou redistribuir o sistema (ou partes dele) sem autorização.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="disponibilidade" title="6. Disponibilidade do serviço">
                <p>
                    Fazemos o possível para manter o TLGestão disponível e funcionando corretamente,
                    mas não garantimos operação ininterrupta ou livre de erros. Manutenções,
                    instabilidades de terceiros (ex.: provedores de infraestrutura) ou casos fortuitos
                    podem causar indisponibilidade temporária.
                </p>
            </LegalSection>

            <LegalSection id="propriedade" title="7. Propriedade intelectual">
                <p>
                    O código, design, marca e demais elementos do TLGestão pertencem a{" "}
                    <strong>{RESPONSAVEL}</strong>, salvo bibliotecas de terceiros usadas sob suas
                    próprias licenças. Os dados que você insere no sistema continuam sendo seus.
                </p>
            </LegalSection>

            <LegalSection id="responsabilidade" title="8. Limitação de responsabilidade">
                <p>
                    Na máxima extensão permitida pela lei, o TLGestão não se responsabiliza por danos
                    indiretos, lucros cessantes ou perda de dados decorrentes do uso ou da
                    impossibilidade de uso da plataforma, ressalvados os casos de dolo ou culpa grave.
                </p>
            </LegalSection>

            <LegalSection id="cancelamento" title="9. Cancelamento e encerramento de conta">
                <p>
                    Você pode deixar de usar o TLGestão a qualquer momento. Nos reservamos o direito
                    de suspender ou encerrar contas que violem estes Termos, mediante aviso quando
                    possível.
                </p>
            </LegalSection>

            <LegalSection id="alteracoes" title="10. Alterações destes termos">
                <p>
                    Estes Termos podem ser atualizados periodicamente. Mudanças relevantes serão
                    comunicadas por um aviso na plataforma ou por e-mail. O uso contínuo do TLGestão
                    após uma alteração significa que você concorda com os novos termos.
                </p>
            </LegalSection>

            <LegalSection id="foro" title="11. Lei aplicável e foro">
                <p>
                    Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito
                    o foro da comarca de {FORO} para dirimir eventuais controvérsias, salvo disposição
                    legal em contrário.
                </p>
            </LegalSection>

            <LegalSection id="contato" title="12. Contato">
                <p>
                    Dúvidas sobre estes Termos podem ser enviadas para{" "}
                    <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a>.
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
