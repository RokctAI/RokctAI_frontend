"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    DollarSign,
    Settings,
    Menu,
    X,
    FolderOpen,
    BarChart3,
    FileDown,
    ExternalLink,
    AlertCircle
} from "lucide-react";

import { getLendingLicenseDetails } from "@/app/lib/roles";

export default function LendingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [licenseDetails, setLicenseDetails] = useState<{
        isLicensed: boolean,
        country: string | null,
        compliance?: {
            deadline: Date | null,
            daysRemaining: number | null,
            isDueSoon: boolean,
            isOverdue: boolean
        }
    } | null>(null);

    React.useEffect(() => {
        getLendingLicenseDetails().then(setLicenseDetails);
    }, []);

    const navItems = [
        { label: "Dashboard", href: "/handson/all/lending", icon: LayoutDashboard },
        { label: "Applications", href: "/handson/all/lending/application", icon: FileText },
        { label: "Loans", href: "/handson/all/lending/loan", icon: CreditCard },
        { label: "Repayments", href: "/handson/all/lending/repayment", icon: DollarSign },
        { label: "Reports", href: "/handson/all/lending/reports", icon: BarChart3 },
        { label: "Products", href: "/handson/all/lending/product", icon: FolderOpen }, // Adding Products view
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:h-screen sticky top-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Lending
                    </span>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center h-16 px-4 bg-white border-b border-gray-200 sticky top-0 z-30">
                    <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 text-lg font-semibold text-gray-900">Lending</span>
                </header>

                {/* Compliance Warning Banner */}
                {licenseDetails?.compliance?.isOverdue && (
                    <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-red-800 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>
                                <strong>Compliance Overdue:</strong> Your Annual NCR Returns were due on {licenseDetails.compliance.deadline ? new Date(licenseDetails.compliance.deadline).toLocaleDateString() : 'Unknown'}.
                            </span>
                        </div>
                        <Link
                            href="/handson/all/lending/reports/ncr-form-40"
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap"
                        >
                            Complete Return Now
                        </Link>
                    </div>
                )}

                {licenseDetails?.compliance?.isDueSoon && !licenseDetails?.compliance?.isOverdue && (
                    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-blue-800 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>
                                <strong>Upcoming Deadline:</strong> Annual NCR Returns are due in {licenseDetails.compliance.daysRemaining} days (by {licenseDetails.compliance.deadline ? new Date(licenseDetails.compliance.deadline).toLocaleDateString() : 'Unknown'}).
                            </span>
                        </div>
                        <Link
                            href="/handson/all/lending/reports/ncr-form-40"
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap"
                        >
                            Prepare Return
                        </Link>
                    </div>
                )}

                {/* License Warning Banner - Only show if not licensed */}
                {licenseDetails?.isLicensed === false && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-4">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-amber-900 font-semibold">Registration Required</h3>
                                    <p className="text-amber-800 text-sm mt-1">
                                        You are missing a valid Credit Provider License.
                                        {licenseDetails.country === "South Africa" ? (
                                            " In South Africa, you must be registered with the NCR to provide loans."
                                        ) : (
                                            " Lending features are restricted until a license is configured."
                                        )}
                                    </p>
                                </div>
                            </div>

                            {licenseDetails.country === "South Africa" && (
                                <div className="flex items-center space-x-3 flex-shrink-0">
                                    <a
                                        href="https://www.ncr.org.za/index.php/act/list-of-forms?download=442:form-2-application-for-registration-as-credit-provider"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <FileDown className="w-4 h-4 mr-2" />
                                        Download NCR Form 2
                                    </a>
                                    {/* Future feature placeholder */}
                                    {/* <button disabled title="Coming Soon" className="text-xs text-amber-600 hover:text-amber-700 underline">
                                        Use our Registration Service (Coming Soon)
                                     </button> */}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
