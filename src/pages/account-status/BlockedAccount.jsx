import AccountStatusScreen from "./AccountStatusScreen";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS } from "../../utils/accountStatus";

export default function BlockedAccount() {
    return (
        <AccountStatusScreen
            tone="danger"
            title="Acesso bloqueado"
            message="O acesso à sua conta está temporariamente bloqueado. Entre em contato com o administrador para obter mais informações."
            statusLabel={ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.BLOCKED]}
        />
    );
}
