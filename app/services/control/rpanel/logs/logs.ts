import { ControlBaseService } from "../../base";

export class LogsService {
    static async getLogStats(website: string) {
        return ControlBaseService.call('rpanel.hosting.log_viewer.get_log_stats', { website_name: website });
    }

    static async getLogContent(website: string, logType: string, lines: number = 100) {
        let method = '';
        switch (logType) {
            case 'nginx_access': method = 'get_nginx_access_log'; break;
            case 'nginx_error': method = 'get_nginx_error_log'; break;
            case 'php_error': method = 'get_php_error_log'; break;
            case 'application': method = 'get_application_log'; break;
            default: throw new Error("Invalid log type");
        }
        return ControlBaseService.call(`rpanel.hosting.log_viewer.${method}`, { website_name: website, lines });
    }

    static async clearLog(website: string, logType: string) {
        return ControlBaseService.call('rpanel.hosting.log_viewer.clear_log', { website_name: website, log_type: logType });
    }
}
