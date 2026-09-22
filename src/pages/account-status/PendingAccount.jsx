import { MessageCircle } from "lucide-react";
import AccountStatusScreen from "./AccountStatusScreen";
import Button from "../../components/ui/Button";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS } from "../../utils/accountStatus";
import { buildWhatsAppSupportLink } from "../../config/plans";

export default function PendingAccount() {
    return (
        <AccountStatusScreen
            tone="warning"
            title="Sua conta está aguardando liberação"
            message="Seu cadastro foi realizado com sucesso. Fale comigo pelo WhatsApp para agilizar a liberação do seu acesso ao TLGestão."
            statusLabel={ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.PENDING]}
        >
            <a
                href={buildWhatsAppSupportLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <Button variant="amber" className="w-full" icon={MessageCircle}>
                    Falar no WhatsApp
                </Button>
            </a>
        </AccountStatusScreen>
    );
}
