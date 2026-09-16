import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getOnboardingProgress, dismissOnboarding } from "../services/onboardingService";

export function useOnboarding() {
    const { user, business } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dismissedLocally, setDismissedLocally] = useState(false);

    useEffect(() => {
        if (!user || !business) return;
        getOnboardingProgress(business, user.uid)
            .then(setProgress)
            .finally(() => setLoading(false));
    }, [user, business]);

    const alreadyDismissed = business?.onboarding?.dismissed || dismissedLocally;
    const isComplete = progress && progress.completedCount === progress.totalCount;
    const shouldShow = !loading && progress && !alreadyDismissed && !isComplete;

    const dismiss = async () => {
        setDismissedLocally(true); // esconde na hora, sem esperar o Firestore
        if (user) {
            try {
                await dismissOnboarding(user.uid);
            } catch (err) {
                console.error("[NexoGestão] Erro ao ocultar onboarding:", err);
            }
        }
    };

    return { progress, loading, shouldShow, dismiss };
}