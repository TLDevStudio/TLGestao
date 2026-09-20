import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Package, AlertTriangle, Repeat } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { TableRowSkeleton } from "../components/ui/Loading";
import ProductFormModal from "../components/products/ProductFormModal";
import StockMovementModal from "../components/products/StockMovementModal";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { deleteProduct } from "../services/productService";
import { formatCurrency } from "../utils/formatters";
import useIsDemoAccount from "../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../utils/demoGuard";

const COLUMNS = [
    { key: "product", label: "Produto" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Categoria" },
    { key: "salePrice", label: "Preço" },
    { key: "stock", label: "Estoque" },
    { key: "actions", label: "", className: "text-right" },
];

export default function Produtos() {
    const { user } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [onlyLowStock, setOnlyLowStock] = useState(false);

    const { products, allProductsCount, categories, lowStockCount, loading, error } = useProducts({
        search,
        category,
        onlyLowStock,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockProduct, setStockProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const categoryOptions = [
        { value: "all", label: "Todas as categorias" },
        ...categories.map((c) => ({ value: c, label: c })),
    ];

    const openCreateModal = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            setProductToDelete(null);
            return;
        }
        setDeleting(true);
        try {
            await deleteProduct(user.uid, productToDelete.id, productToDelete.name, productToDelete.photoUrl);
            toast.success("Produto excluído.");
            setProductToDelete(null);
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível excluir o produto.");
        } finally {
            setDeleting(false);
        }
    };

    const hasNoProductsAtAll = !loading && allProductsCount === 0;
    const hasNoResults = !loading && allProductsCount > 0 && products.length === 0;

    const searchEmptyState = (
        <EmptyState
            icon={Search}
            title="Nenhum produto encontrado"
            description="Tente ajustar a busca ou os filtros selecionados."
        />
    );

    return (
        <div className="space-y-5">
            {lowStockCount > 0 && (
                <button
                    onClick={() => setOnlyLowStock((v) => !v)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${onlyLowStock
                        ? "border-amber-500 bg-amber-100"
                        : "border-amber-500/30 bg-amber-100/60 hover:bg-amber-100"
                        }`}
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-sm text-ink">
                        <strong>{lowStockCount} produto(s)</strong> com estoque abaixo do mínimo.{" "}
                        <span className="underline">{onlyLowStock ? "Mostrar todos" : "Ver apenas esses"}</span>
                    </p>
                </button>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Input
                        icon={Search}
                        placeholder="Pesquisar por nome ou SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full sm:max-w-xs"
                    />
                    <div className="w-full sm:w-48">
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                </div>
                {/* Ocupa a linha inteira no mobile, tamanho normal a partir de sm */}
                <Button icon={Plus} onClick={openCreateModal} className="btn-fx btn-pine w-full sm:w-auto sm:shrink-0">
                    Novo produto
                </Button>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {hasNoProductsAtAll ? (
                <EmptyState
                    icon={Package}
                    title="Você ainda não possui produtos cadastrados."
                    description="Cadastre seus produtos para controlar estoque e usá-los nas vendas."
                    action={
                        <Button icon={Plus} onClick={openCreateModal}>
                            Cadastrar primeiro produto
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* ---------- MOBILE: lista de cartões ---------- */}
                    <div className="space-y-3 md:hidden">
                        {loading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-line bg-surface p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
                                        <div className="skeleton h-4 w-2/5" />
                                    </div>
                                    <div className="skeleton mt-3 h-3 w-1/3" />
                                </div>
                            ))}

                        {hasNoResults && (
                            <div className="rounded-2xl border border-line bg-surface p-6">
                                {searchEmptyState}
                            </div>
                        )}

                        {!loading &&
                            products.map((product) => {
                                const isLow = Number(product.stock) <= Number(product.minStock ?? 0);
                                return (
                                    <div
                                        key={product.id}
                                        className="rounded-2xl border border-line bg-surface p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-dim">
                                                {product.photoUrl ? (
                                                    <img
                                                        src={product.photoUrl}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Package size={16} className="text-ink-soft" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-ink break-words">{product.name}</p>
                                                <p className="text-xs text-ink-soft">
                                                    {product.sku ? `SKU ${product.sku}` : "Sem SKU"}
                                                    {product.category ? ` · ${product.category}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-semibold text-ink">
                                                    {formatCurrency(product.salePrice)}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                                                    Estoque: {product.stock}
                                                    {isLow && <Badge tone="amber">Baixo</Badge>}
                                                </span>
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setStockProduct(product)}
                                                    className="rounded-lg p-2 text-ink-soft active:bg-paper-dim active:text-ink"
                                                    aria-label="Movimentar estoque"
                                                >
                                                    <Repeat size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="rounded-lg p-2 text-ink-soft active:bg-paper-dim active:text-ink"
                                                    aria-label="Editar produto"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setProductToDelete(product)}
                                                    className="rounded-lg p-2 text-ink-soft active:bg-danger-100 active:text-danger"
                                                    aria-label="Excluir produto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {/* ---------- DESKTOP: tabela ---------- */}
                    <div className="hidden md:block">
                        <Table
                            columns={COLUMNS}
                            empty={hasNoResults && <div className="p-8">{searchEmptyState}</div>}
                        >
                            {loading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={6} />
                                ))}

                            {!loading &&
                                products.map((product) => {
                                    const isLow = Number(product.stock) <= Number(product.minStock ?? 0);
                                    return (
                                        <tr key={product.id} className="hover:bg-paper-dim/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-dim">
                                                        {product.photoUrl ? (
                                                            <img
                                                                src={product.photoUrl}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package size={15} className="text-ink-soft" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-ink">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-ink-soft">{product.sku || "—"}</td>
                                            <td className="px-4 py-3 text-ink-soft">{product.category || "—"}</td>
                                            <td className="px-4 py-3 text-ink">
                                                {formatCurrency(product.salePrice)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-ink">{product.stock}</span>
                                                    {isLow && <Badge tone="amber">Baixo</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => setStockProduct(product)}
                                                        className="rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
                                                        aria-label="Movimentar estoque"
                                                        title="Movimentar estoque"
                                                    >
                                                        <Repeat size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
                                                        aria-label="Editar produto"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setProductToDelete(product)}
                                                        className="rounded-lg p-2 text-ink-soft hover:bg-danger-100 hover:text-danger"
                                                        aria-label="Excluir produto"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </Table>
                    </div>
                </>
            )}

            <ProductFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                product={editingProduct}
            />

            <StockMovementModal
                open={!!stockProduct}
                onClose={() => setStockProduct(null)}
                product={stockProduct}
            />

            <ConfirmDialog
                open={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Excluir produto"
                description={`Tem certeza que deseja excluir "${productToDelete?.name}"? Essa ação não pode ser desfeita.`}
                confirmLabel="Excluir"
            />
        </div>
    );
}