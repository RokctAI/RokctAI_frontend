"use client";

import { Loader2, Search, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPOSProducts, getPOSCategories, createPOSOrder } from "@/app/actions/paas/admin/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const [prodData, catData] = await Promise.all([
                    getPOSProducts(),
                    getPOSCategories()
                ]);
                setProducts(prodData);
                setCategories(catData);
            } catch (error) {
                console.error("Error initializing POS:", error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    useEffect(() => {
        async function filterProducts() {
            setLoading(true);
            try {
                const data = await getPOSProducts(selectedCategory === "all" ? "" : selectedCategory, search);
                setProducts(data);
            } catch (error) {
                console.error("Error filtering products:", error);
            } finally {
                setLoading(false);
            }
        }
        const debounce = setTimeout(filterProducts, 500);
        return () => clearTimeout(debounce);
    }, [search, selectedCategory]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.name === product.name);
            if (existing) {
                return prev.map(item =>
                    item.name === product.name
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (name: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.name === name) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (name: string) => {
        setCart(prev => prev.filter(item => item.name !== name));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            await createPOSOrder({ items: cart, total: calculateTotal() });
            toast.success("Order placed successfully");
            setCart([]);
        } catch (error) {
            toast.error("Failed to place order");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
            {/* Left Side: Products */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="w-[400px] whitespace-nowrap">
                        <div className="flex gap-2 pb-2">
                            <Button
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                onClick={() => setSelectedCategory("all")}
                            >
                                All
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat.name}
                                    variant={selectedCategory === cat.name ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <ScrollArea className="flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                            {products.map(product => (
                                <Card
                                    key={product.name}
                                    className="cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className="p-4">
                                        <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-medium truncate" title={product.name}>{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Right Side: Cart */}
            <Card className="w-[400px] flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="size-4" />
                        Current Order
                    </h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Cart is empty
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.name} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="size-6"
                                            onClick={() => updateQuantity(item.name, -1)}
                                        >
                                            <Minus className="size-3" />
                                        </Button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="size-6"
                                            onClick={() => updateQuantity(item.name, 1)}
                                        >
                                            <Plus className="size-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-6 text-red-500"
                                            onClick={() => removeFromCart(item.name)}
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={cart.length === 0 || processing}
                        onClick={handleCheckout}
                    >
                        {processing ? <Loader2 className="animate-spin mr-2" /> : null}
                        Checkout
                    </Button>
                </div>
            </Card>
        </div>
    );
}
