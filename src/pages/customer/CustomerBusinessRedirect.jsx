import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getPublicBusiness } from "../../services/customerPortalService";
import { FullPageLoading } from "../../components/ui/Loading";

export default function CustomerBusinessRedirect() {
    const { businessId } = useParams();
    const [slug, setSlug] = useState(undefined); // undefined = carregando, null = não encontrado

    useEffect(() => {
        let cancelled = false;
        getPublicBusiness(businessId)
            .then((data) => {
                if (!cancelled) setSlug(data?.publicSlug || null);
            })
            .catch(() => {
                if (!cancelled) setSlug(null);
            });
        return () => {
            cancelled = true;
        };
    }, [businessId]);

    if (slug === undefined) return <FullPageLoading label="Redirecionando..." />;
    if (!slug) return <Navigate to="/" replace />;

    return <Navigate to={`/agendar/${slug}`} replace />;
}