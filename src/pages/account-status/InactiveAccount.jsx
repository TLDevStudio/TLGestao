import AccountStatusScreen from "./AccountStatusScreen";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS } from "../../utils/accountStatus";

export default function InactiveAccount() {
    return (
        <AccountStatusScreen
            tone="neutral"
            title="Conta inativa"
            message="Esta conta está atualmente inativa. Entre em contato com o administrador caso precise reativar seu acesso."
            statusLabel={ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.INACTIVE]}
        />
    );
}
