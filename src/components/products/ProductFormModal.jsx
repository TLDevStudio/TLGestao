import { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Package, Tag, Hash, DollarSign, Boxes, AlertTriangle, Truck, FileText, ImagePlus } from "lucide-react";
import { maskCurrency, parseCurrencyInput } from "../../utils/masks";
import { createProduct, updateProduct } from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const emptyForm = {
    name: "",
    sku: "",
    category: "",
    salePriceDisplay: "",
    costPriceDisplay: "",
    stock: "0",
    minStock: "0",
    supplier: "",
    description: "",
};

export default function ProductFormModal({ open, onClose, product }) {
    const { user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEditing = !!product;

    useEffect(() => {
        if (open) {
            setForm(
                product
                    ? {
                        ...emptyForm,
                        ...product,
                        salePriceDisplay: product.salePrice
                            ? product.salePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "",
                        costPriceDisplay: product.costPrice
                            ? product.costPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "",
                        stock: String(product.stock ?? 0),
                        minStock: String(product.minStock ?? 0),
                    }
                    : emptyForm
            );
            setPhotoPreview(product?.photoUrl || null);
            setPhotoFile(null);
            setError("");
        }
    }, [open, product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "salePriceDisplay" || name === "costPriceDisplay") {
            setForm((f) => ({ ...f, [name]: maskCurrency(value) }));
            return;
        }
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("O nome do produto é obrigatório.");
            return;
        }

        const payload = {
            ...form,
            salePrice: parseCurrencyInput(form.salePriceDisplay || "0"),
            costPrice: parseCurrencyInput(form.costPriceDisplay || "0"),
            minStock: Number(form.minStock) || 0,
            stock: Number(form.stock) || 0,
        };

        setSaving(true);
        try {
            if (isEditing) {
                await updateProduct(user.uid, product.id, payload, photoFile);
                toast.success("Produto atualizado com sucesso.");
            } else {
                await createProduct(user.uid, payload, photoFile);
                toast.success("Produto cadastrado com sucesso.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar o produto. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar produto" : "Novo produto"}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? "Salvar alterações" : "Cadastrar produto"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper-dim text-ink-soft hover:border-pine-700 hover:text-pine-800"
                    >
                        {photoPreview ? (
                            <img src={photoPreview} alt="Prévia do produto" className="h-full w-full object-cover" />
                        ) : (
                            <ImagePlus size={22} />
                        )}
                    </button>
                    <div className="text-sm text-ink-soft">
                        <p className="font-medium text-ink">Foto do produto (opcional)</p>
                        <p>PNG ou JPG. Clique no quadro para escolher uma imagem.</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                </div>

                <Input
                    id="name"
                    name="name"
                    label="Nome do produto"
                    icon={Package}
                    placeholder="Digite o nome do produto"
                    value={form.name}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="sku"
                        name="sku"
                        label="SKU (opcional)"
                        icon={Hash}
                        placeholder="Código do produto"
                        value={form.sku}
                        onChange={handleChange}
                    />
                    <Input
                        id="category"
                        name="category"
                        label="Categoria"
                        icon={Tag}
                        placeholder="Digite a categoria do produto"
                        value={form.category}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="costPriceDisplay"
                        name="costPriceDisplay"
                        label="Preço de custo"
                        icon={DollarSign}
                        placeholder="0,00"
                        inputMode="numeric"
                        value={form.costPriceDisplay}
                        onChange={handleChange}
                    />
                    <Input
                        id="salePriceDisplay"
                        name="salePriceDisplay"
                        label="Preço de venda"
                        icon={DollarSign}
                        placeholder="0,00"
                        inputMode="numeric"
                        value={form.salePriceDisplay}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        label={isEditing ? "Estoque atual" : "Estoque inicial"}
                        icon={Boxes}
                        value={form.stock}
                        onChange={handleChange}
                        disabled={isEditing}
                    />
                    <Input
                        id="minStock"
                        name="minStock"
                        type="number"
                        min="0"
                        label="Estoque mínimo"
                        icon={AlertTriangle}
                        value={form.minStock}
                        onChange={handleChange}
                    />
                </div>
                {isEditing && (
                    <p className="-mt-2 text-xs text-ink-soft">
                        Para alterar a quantidade em estoque, use o botão "Movimentar estoque" na listagem.
                    </p>
                )}

                <Input
                    id="supplier"
                    name="supplier"
                    label="Fornecedor (opcional)"
                    icon={Truck}
                    placeholder="Nome do fornecedor"
                    value={form.supplier}
                    onChange={handleChange}
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <FileText size={14} /> Descrição (opcional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={2}
                        placeholder="Detalhes sobre o produto..."
                        value={form.description}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 transition focus:outline-none focus:ring-2 focus:ring-pine-700/20 focus:border-pine-700"
                    />
                </div>

                {error && (
                    <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
                )}
            </form>
        </Modal>
    );
}
