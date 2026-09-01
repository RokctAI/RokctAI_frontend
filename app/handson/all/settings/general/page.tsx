/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NamingSeriesForm } from "@/components/handson/naming-series-form";
import { SystemSettingsForm } from "@/components/handson/system-settings-form";
import { CompanySettingsForm } from "@/components/handson/company-settings-form";
import t from "@/app/lib/i18n";

const DOC_TYPES = {
  SALES_INVOICE: "Sales Invoice",
  PURCHASE_ORDER: "Purchase Order",
  LEAD: "Lead",
  OPPORTUNITY: "Opportunity",
  PROSPECT: "Prospect",
  QUOTATION: "Quotation",
  ITEM: "Item",
  PROJECT: "Project",
} as const;

export default function SetupPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {t("app.settings.general.title")}
      </h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            {t("app.settings.general.tab_general")}
          </TabsTrigger>
          <TabsTrigger value="crm">
            {t("app.settings.general.tab_crm")}
          </TabsTrigger>
          <TabsTrigger value="commercial">
            {t("app.settings.general.tab_commercial")}
          </TabsTrigger>
          <TabsTrigger value="supply_chain">
            {t("app.settings.general.tab_supply_chain")}
          </TabsTrigger>
          <TabsTrigger value="work">
            {t("app.settings.general.tab_work")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <SystemSettingsForm />
            <CompanySettingsForm />
          </div>
        </TabsContent>

        <TabsContent value="crm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("app.settings.general.card_leads")}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.LEAD} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("app.settings.general.card_opportunities")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.OPPORTUNITY} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("app.settings.general.card_prospects")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.PROSPECT} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commercial">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("app.settings.general.card_quotations")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.QUOTATION} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("app.settings.general.card_sales_invoices")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.SALES_INVOICE} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supply_chain">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("app.settings.general.card_purchase_orders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.PURCHASE_ORDER} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("app.settings.general.card_items")}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.ITEM} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("app.settings.general.card_projects")}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.PROJECT} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
