import { ControlBaseService } from "../../base";

export class CronService {
    static async getCronJobs(website?: string) {
        return ControlBaseService.call('rpanel.hosting.doctype.cron_job.cron_job.get_cron_jobs', { website });
    }

    static async createCronJob(data: any) {
        return ControlBaseService.call('rpanel.hosting.doctype.cron_job.cron_job.create_cron_job', { ...data });
    }

    static async updateCronJob(name: string, data: any) {
        return ControlBaseService.call('rpanel.hosting.doctype.cron_job.cron_job.update_cron_job', { name, ...data });
    }

    static async deleteCronJob(name: string) {
        return ControlBaseService.call('rpanel.hosting.doctype.cron_job.cron_job.delete_cron_job', { name });
    }
}
