import { BaseService, ServiceOptions } from "@/app/services/common/base";

export interface AttendanceData {
    employee: string;
    attendance_date: string;
    status: "Present" | "Absent" | "Half Day" | "On Leave" | "Work From Home";
    company: string;
    in_time?: string;
    out_time?: string;
}

export class AttendanceService {
    static async getList(filters: any = {}, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Attendance",
            filters: filters,
            fields: ["name", "employee", "employee_name", "attendance_date", "status", "in_time", "out_time", "working_hours"],
            limit_page_length: 50,
            order_by: "attendance_date desc, in_time desc"
        }, options);
        return response?.message || [];
    }

    static async getTodayAttendance(employee: string, options?: ServiceOptions) {
        const today = new Date().toISOString().split('T')[0];
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Attendance",
            filters: { employee: employee, attendance_date: today },
            fields: ["name", "in_time", "out_time", "status"],
            limit_page_length: 1
        }, options);
        return response?.message?.[0] || null;
    }

    static async create(data: Partial<AttendanceData>, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Attendance",
                ...data
            }
        }, options);
        return response?.message;
    }

    static async update(name: string, data: Partial<AttendanceData>, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Attendance",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }

    static async checkIn(employee: string, company: string, timestamp: string, options?: ServiceOptions) {
        const existing = await this.getTodayAttendance(employee, options);
        if (existing) {
            throw new Error("Already checked in today.");
        }

        return await this.create({
            employee: employee,
            attendance_date: timestamp.split('T')[0],
            status: "Present",
            in_time: timestamp,
            company: company
        }, options);
    }

    static async checkOut(employee: string, timestamp: string, options?: ServiceOptions) {
        const existing = await this.getTodayAttendance(employee, options);
        if (!existing) {
            throw new Error("No attendance record found for today. Please Check In first.");
        }

        return await this.update(existing.name, { out_time: timestamp }, options);
    }
}
