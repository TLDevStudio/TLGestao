import { useContext } from "react";
import { CustomerAuthContext } from "../contexts/CustomerAuthContext";

export function useCustomerAuth() {
    const ctx = useContext(CustomerAuthContext);
    if (!ctx) {
        throw new Error("useCustomerAuth deve ser usado dentro de <CustomerAuthProvider>");
    }
    return ctx;
}