// Configuração da conta de demonstração pública do TLGestão.
//
// Estas credenciais são públicas por natureza — são mostradas a
// qualquer visitante que clique em "Ver demonstração" na Landing Page.
// Não é um segredo administrativo, então não há problema em manter
// aqui, mas é bom manter só neste arquivo (nenhum outro lugar do
// projeto deve ter e-mail/senha da demo "hardcoded").
//
// Para trocar o e-mail/senha usados pela demonstração no futuro, siga
// o passo a passo do pacote da Fase 4 (recriar a conta) e atualize os
// valores abaixo.
export const DEMO_CONFIG = {
    email: "tlgestao@email.com",
    password: "123456",
    // Preenchido depois de criar a conta demo (ver passo a passo da Fase 4).
    // Usado nas próximas fases para identificar a conta demo e aplicar
    // proteções especiais a ela (Fase 5).
    uid: "l8Ktm44mLcS3YKBG0OejAoAxFtu1",
};
