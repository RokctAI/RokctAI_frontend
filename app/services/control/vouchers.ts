import { ControlBaseService } from "./base";

export class VoucherService {
    static async getVouchers() {
        return ControlBaseService.getList("Subscription Voucher", {
            fields: ["*"],
            order_by: "creation desc"
        });
    }

    static async createVoucher(data: any) {
        return ControlBaseService.insert({
            doctype: "Subscription Voucher",
            ...data
        });
    }

    static async updateVoucher(name: string, data: any) {
        return ControlBaseService.update("Subscription Voucher", name, data);
    }

    static async deleteVoucher(name: string) {
        return ControlBaseService.delete("Subscription Voucher", name);
    }
}
