import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { adjustStock } from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function StockMovementModal({ open, onClose, product }) {
    const { user } = useAuth();
    const toast = useToast();
    const [type, setType] = useState("in");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        setType("in");
        setQuantity("1");
        setReason("");
        setError("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const qty = Number(quantity);
        if (!qty || qty <= 0) {
            setError("Informe uma quantidade válida.");
            return;
        }
        if (type === "out" && qty > Number(product.stock)) {
            setError("Quantidade de saída maior que o estoque disponível.");
            return;
        }

        setSaving(true);
        try {
            await adjustStock(user.uid, product, { type, quantity: qty, reason });
            toast.success(type === "in" ? "Entrada registrada." : "Saída registrada.");
            handleClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível registrar a movimentação.");
        } finally {
            setSaving(false);
        }
    };

    if (!product) return null;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={`Movimentar estoque — ${product.name}`}
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        Confirmar
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-ink-soft">
                    Estoque atual: <strong className="text-ink">{product.stock}</strong> unidade(s)
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setType("in")}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${type === "in"
                                ? "border-success bg-success-100 text-success"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }`}
                    >
                        <ArrowUpCircle size={16} /> Entrada
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("out")}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${type === "out"
                                ? "border-danger bg-danger-100 text-danger"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }`}
                    >
                        <ArrowDownCircle size={16} /> Saída
                    </button>
                </div>

                <Input
                    id="quantity"
                    type="number"
                    min="1"
                    label="Quantidade"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    autoFocus
                />

                <Input
                    id="reason"
                    label="Motivo (opcional)"
                    placeholder="Ex: Compra de fornecedor, perda, ajuste..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />

                {error && (
                    <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
                )}
            </form>
        </Modal>
    );
}
