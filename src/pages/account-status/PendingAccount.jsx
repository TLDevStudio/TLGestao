import AccountStatusScreen from "./AccountStatusScreen";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS } from "../../utils/accountStatus";

export default function PendingAccount() {
    return (
        <AccountStatusScreen
            tone="warning"
            title="Sua conta está aguardando liberação"
            message="Seu cadastro foi realizado com sucesso. O acesso ao TLGestão será liberado pelo administrador após a confirmação da sua conta."
            statusLabel={ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.PENDING]}
        />
    );
}
