"use client";

import { useState } from "react";
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
import ProductList from "../../lending/product/page";
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
  const [selectedTemplate, setSelectedTemplate] = useState("unsecured");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('app.settings.general.title')}</h1>
 
      <Tabs defaultValue="lending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('app.settings.general.tab_general')}</TabsTrigger>
          <TabsTrigger value="crm">{t('app.settings.general.tab_crm')}</TabsTrigger>
          <TabsTrigger value="commercial">{t('app.settings.general.tab_commercial')}</TabsTrigger>
          <TabsTrigger value="supply_chain">{t('app.settings.general.tab_supply_chain')}</TabsTrigger>
          <TabsTrigger value="work">{t('app.settings.general.tab_work')}</TabsTrigger>
          <TabsTrigger value="lending">{t('app.settings.general.tab_lending')}</TabsTrigger>
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
                <CardTitle>{t('app.settings.general.card_leads')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.LEAD} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.settings.general.card_opportunities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.OPPORTUNITY} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.settings.general.card_prospects')}</CardTitle>
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
                <CardTitle>{t('app.settings.general.card_quotations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.QUOTATION} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.settings.general.card_sales_invoices')}</CardTitle>
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
                <CardTitle>{t('app.settings.general.card_purchase_orders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.PURCHASE_ORDER} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.settings.general.card_items')}</CardTitle>
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
                <CardTitle>{t('app.settings.general.card_projects')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NamingSeriesForm doctype={DOC_TYPES.PROJECT} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
 
        <TabsContent value="lending">
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {t('app.settings.general.lending_title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('app.settings.general.lending_desc')}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="unsecured">
                    {t('app.settings.general.tpl_unsecured')}
                  </option>
                  <option value="shortterm">
                    {t('app.settings.general.tpl_shortterm')}
                  </option>
                </select>
                <button
                  onClick={async () => {
                    const seeds =
                      await import("@/app/actions/handson/all/lending/seed_product");
                    let res;
                    if (selectedTemplate === "unsecured")
                      res = await seeds.createDefaultUnsecuredProduct();
                    else res = await seeds.createDefaultShortTermProduct();
 
                    if (res.success) alert(res.message);
                    else alert(t('app.settings.general.notice') + res.message);
                  }}
                  className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                >
                  {t('app.settings.general.btn_init')}
                </button>
              </div>
            </div>
 
            <div className="border border-gray-200 rounded-xl p-6">
              <ProductList />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
