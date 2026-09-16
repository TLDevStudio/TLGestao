import { useState } from "react";
import { Search, Package, Scissors, Plus } from "lucide-react";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { useProducts } from "../../hooks/useProducts";
import { useServices } from "../../hooks/useServices";
import { formatCurrency } from "../../utils/formatters";

export default function ItemPicker({ onAddItem }) {
    const [tab, setTab] = useState("service");
    const [search, setSearch] = useState("");

    const { products, loading: loadingProducts } = useProducts({ search });
    const { services, loading: loadingServices } = useServices({ search, status: "active" });

    const isServices = tab === "service";
    const list = isServices ? services : products;
    const loading = isServices ? loadingServices : loadingProducts;

    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex rounded-xl border border-line bg-paper-dim p-1">
                <button
                    onClick={() => setTab("service")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${isServices ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
                        }`}
                >
                    <Scissors size={15} /> Serviços
                </button>
                <button
                    onClick={() => setTab("product")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${!isServices ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
                        }`}
                >
                    <Package size={15} /> Produtos
                </button>
            </div>

            <Input
                icon={Search}
                placeholder={isServices ? "Buscar serviço..." : "Buscar produto..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                containerClassName="mb-3"
            />

            <div className="max-h-[420px] space-y-2 overflow-y-auto">
                {loading && <p className="py-6 text-center text-sm text-ink-soft">Carregando...</p>}

                {!loading && list.length === 0 && (
                    <EmptyState
                        icon={isServices ? Scissors : Package}
                        title={isServices ? "Nenhum serviço encontrado" : "Nenhum produto encontrado"}
                        description={
                            isServices
                                ? "Cadastre serviços ativos para vendê-los aqui."
                                : "Cadastre produtos para vendê-los aqui."
                        }
                    />
                )}

                {!loading &&
                    list.map((item) => {
                        const outOfStock = !isServices && Number(item.stock) <= 0;
                        return (
                            <button
                                key={item.id}
                                onClick={() => !outOfStock && onAddItem(item, tab)}
                                disabled={outOfStock}
                                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition hover:border-pine-700 hover:bg-paper-dim/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                    <p className="text-xs text-ink-soft">
                                        {isServices
                                            ? `${item.duration} min`
                                            : outOfStock
                                                ? "Sem estoque"
                                                : `${item.stock} em estoque`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Badge tone="pine">
                                        {formatCurrency(isServices ? item.price : item.salePrice)}
                                    </Badge>
                                    <Plus size={15} className="text-ink-soft" />
                                </div>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}
