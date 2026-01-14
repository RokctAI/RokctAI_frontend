export interface AssetMaintenanceData {
    asset_name: string;
    company: string;
    maintenance_team: string; // User/Team
    maintenance_tasks: {
        maintenance_task: string;
        description?: string;
        start_date?: string;
        end_date?: string;
    }[];
}
