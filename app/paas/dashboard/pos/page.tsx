"use client";

import { Loader2, Search, ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createPOSOrder } from "@/app/actions/paas/pos";
import { getProducts } from "@/app/actions/paas/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


interface Product {
    name: string;
    item_name: string;
    standard_rate: number;
    image?: string;
    stock_uom?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const data = await getProducts(1, 100); // Fetch first 100 products for now
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    const addToCart = (product: Product) => {
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

    const removeFromCart = (productName: string) => {
        setCart(prev => prev.filter(item => item.name !== productName));
    };

    const updateQuantity = (productName: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.name === productName) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.standard_rate * item.quantity), 0);
    const tax = subtotal * 0.1; // Assuming 10% tax for demo
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setProcessing(true);
        try {
            const orderData = {
                order_items: cart.map(item => ({
                    product: item.name,
                    quantity: item.quantity,
                    price: item.standard_rate
                })),
                grand_total: total,
                tax: tax,
                // Add other necessary fields
            };

            await createPOSOrder(orderData);
            toast.success("Order placed successfully!");
            setCart([]);
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Failed to place order");
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
            {/* Left Side: Product Grid */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.name}
                                className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                onClick={() => addToCart(product)}
                            >
                                <div className="aspect-square relative bg-muted">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.item_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-3">
                                    <h3 className="font-medium truncate" title={product.item_name}>{product.item_name}</h3>
                                    <p className="text-sm font-bold text-primary">${product.standard_rate.toFixed(2)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Side: Cart Summary */}
            <Card className="w-[400px] flex flex-col h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="size-5" />
                        Current Order
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full px-6">
                        <div className="space-y-4 py-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Cart is empty
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.name} className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{item.item_name}</h4>
                                            <p className="text-xs text-muted-foreground">${item.standard_rate.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => updateQuantity(item.name, -1)}
                                            >
                                                <Minus className="size-3" />
                                            </Button>
                                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => updateQuantity(item.name, 1)}
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                        </div>
                                        <div className="text-right min-w-[60px]">
                                            <p className="font-medium text-sm">${(item.standard_rate * item.quantity).toFixed(2)}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 text-red-500 hover:text-red-600 -mr-2"
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
                </CardContent>
                <Separator />
                <CardFooter className="flex-col gap-4 pt-6">
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={cart.length === 0 || processing}
                        onClick={handleCheckout}
                    >
                        {processing ? (
                            <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                            <CreditCard className="size-4 mr-2" />
                        )}
                        Charge ${total.toFixed(2)}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
