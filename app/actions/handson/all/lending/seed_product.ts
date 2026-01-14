"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { ProductService } from "@/app/services/all/lending/product";

export async function createDefaultUnsecuredProduct() {
    if (!await verifyLendingRole()) return { success: false, message: "Unauthorized" };

    try {
        await ProductService.create({
            item_code: "Unsecured Personal Loan",
            product_name: "Unsecured Personal Loan",
            rate_of_interest: 28, // Just under the 29% cap
            currency: "ZAR",
            is_term_loan: 1,
            repayment_method: "Repay Fixed Amount per Period"
        });

        revalidatePath("/handson/all/lending/product");
        return { success: true, message: "Unsecured Personal Loan created successfully." };
    } catch (e: any) {
        if (e.message === "Product already exists.") {
            return { success: false, message: e.message };
        }
        console.error(e);
        return { success: false, message: "Failed to create product." };
    }
}

export async function createDefaultShortTermProduct() {
    if (!await verifyLendingRole()) return { success: false, message: "Unauthorized" };

    try {
        await ProductService.create({
            item_code: "1-Month Micro Loan",
            product_name: "1-Month Micro Loan",
            rate_of_interest: 60, // 5% per month * 12
            currency: "ZAR",
            is_term_loan: 1,
            repayment_method: "Repay Fixed Amount per Period"
        });

        revalidatePath("/handson/all/lending/product");
        return { success: true, message: "Short Term Loan created successfully." };
    } catch (e: any) {
        if (e.message === "Product already exists.") {
            return { success: false, message: e.message };
        }
        console.error(e);
        return { success: false, message: "Failed to create product." };
    }
}

export async function createDefaultPawnProduct() {
    if (!await verifyLendingRole()) return { success: false, message: "Unauthorized" };

    try {
        await ProductService.create({
            item_code: "Secured Pawn Loan",
            product_name: "Secured Pawn Loan",
            rate_of_interest: 60, // Short Term Pawn Cap
            currency: "ZAR",
            is_term_loan: 1,
            is_secured_loan: 1, // Crucial for Pawn
            repayment_method: "Repay Fixed Amount per Period"
        });

        revalidatePath("/handson/all/lending/product");
        return { success: true, message: "Pawn Loan created successfully." };
    } catch (e: any) {
        if (e.message === "Product already exists.") {
            return { success: false, message: e.message };
        }
        console.error(e);
        return { success: false, message: "Failed to create product." };
    }
}

