import { Construction } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

/* Página temporária para módulos que ainda serão construídos. */
export default function ComingSoon({ moduleName }) {
  return (
    <EmptyState
      icon={Construction}
      title={`Módulo "${moduleName}" em construção`}
      description="Este módulo será implementado na próxima etapa, seguindo o mesmo padrão de arquitetura do Dashboard e da Autenticação."
    />
  );
}
