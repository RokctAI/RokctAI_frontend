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

// [SDK-MANAGED] The canonical copy of this file lives in the tender module
// (corporate/tender/nextjs/templates/...). Edits here should be mirrored there.

import { ControlBaseService } from "./base";

/**
 * A child-table row flattened out of its parent document. Both tender child
 * tables ("Generated Tender Task" under Intelligent Task Set, "Tender
 * Workflow Task" under Tender Workflow Template) share the same two fields.
 */
export interface TenderChildTaskRow {
  name: string;
  parent: string;
  subject: string;
  due_date_offset_days?: number;
}

export class TenderService {
  /**
   * "Tender Control Settings" is a Single doctype — frappe rejects
   * get_list on Singles, so the one document is read directly. Its only
   * field is `tender_country`.
   */
  static async getTenderControlSettings() {
    return ControlBaseService.getDoc(
      "Tender Control Settings",
      "Tender Control Settings",
    );
  }

  /**
   * "Generated Tender Task" is a child table (istable=1) of Intelligent
   * Task Set — frappe blocks bare get_list on child tables, so rows are
   * read through their parent documents.
   */
  static async getGeneratedTenderTasks(): Promise<TenderChildTaskRow[]> {
    return this.getChildTaskRows("Intelligent Task Set");
  }

  /**
   * "Tender Workflow Task" is a child table (istable=1) of Tender Workflow
   * Template — same parent-based read as above.
   */
  static async getTenderWorkflowTasks(): Promise<TenderChildTaskRow[]> {
    return this.getChildTaskRows("Tender Workflow Template");
  }

  static async getTenderWorkflowTemplates() {
    return ControlBaseService.getList("Tender Workflow Template", {
      // `template_name` and the standard `owner` field (there is no
      // custom `created_by` field on this doctype).
      fields: ["name", "template_name", "owner"],
      order_by: "modified desc",
    });
  }

  static async getIntelligentTaskSets() {
    return ControlBaseService.getList("Intelligent Task Set", {
      // Real fields are `ocid` and the `tasks` child table.
      fields: ["name", "ocid"],
      order_by: "modified desc",
    });
  }

  /** A Single's document name equals its doctype name. */
  static async updateTenderControlSettings(data: any) {
    return ControlBaseService.update(
      "Tender Control Settings",
      "Tender Control Settings",
      data,
    );
  }

  // ---------------------------------------------------------------------
  // Child-table CRUD. Direct frappe.client insert/set_value/delete on an
  // istable doctype is invalid — rows must be written through the parent
  // document, so each helper takes the parent name alongside the row.
  // ---------------------------------------------------------------------

  static async createGeneratedTenderTask(taskSet: string, data: any) {
    return this.appendChildTaskRow(
      "Intelligent Task Set",
      taskSet,
      "Generated Tender Task",
      data,
    );
  }

  static async updateGeneratedTenderTask(
    taskSet: string,
    name: string,
    data: any,
  ) {
    return this.updateChildTaskRow("Intelligent Task Set", taskSet, name, data);
  }

  static async deleteGeneratedTenderTask(taskSet: string, name: string) {
    return this.deleteChildTaskRow("Intelligent Task Set", taskSet, name);
  }

  static async createTenderWorkflowTask(template: string, data: any) {
    return this.appendChildTaskRow(
      "Tender Workflow Template",
      template,
      "Tender Workflow Task",
      data,
    );
  }

  static async updateTenderWorkflowTask(
    template: string,
    name: string,
    data: any,
  ) {
    return this.updateChildTaskRow(
      "Tender Workflow Template",
      template,
      name,
      data,
    );
  }

  static async deleteTenderWorkflowTask(template: string, name: string) {
    return this.deleteChildTaskRow("Tender Workflow Template", template, name);
  }

  // --- Regular (parent) doctype CRUD — unchanged framework paths. ---

  static async createTenderWorkflowTemplate(data: any) {
    return ControlBaseService.insert({
      doctype: "Tender Workflow Template",
      ...data,
    });
  }

  static async updateTenderWorkflowTemplate(name: string, data: any) {
    return ControlBaseService.update("Tender Workflow Template", name, data);
  }

  static async deleteTenderWorkflowTemplate(name: string) {
    return ControlBaseService.delete("Tender Workflow Template", name);
  }

  static async createIntelligentTaskSet(data: any) {
    return ControlBaseService.insert({
      doctype: "Intelligent Task Set",
      ...data,
    });
  }

  static async updateIntelligentTaskSet(name: string, data: any) {
    return ControlBaseService.update("Intelligent Task Set", name, data);
  }

  static async deleteIntelligentTaskSet(name: string) {
    return ControlBaseService.delete("Intelligent Task Set", name);
  }

  // --- Internal helpers -------------------------------------------------

  private static async getChildTaskRows(
    parentDoctype: string,
  ): Promise<TenderChildTaskRow[]> {
    const parents = await ControlBaseService.getList(parentDoctype, {
      fields: ["name"],
      order_by: "modified desc",
    });
    const docs = await Promise.all(
      (parents ?? []).map((p: any) =>
        ControlBaseService.getDoc(parentDoctype, p.name),
      ),
    );
    return docs.flatMap((doc: any) =>
      (doc?.tasks ?? []).map((row: any) => ({
        name: row.name,
        parent: doc.name,
        subject: row.subject,
        due_date_offset_days: row.due_date_offset_days,
      })),
    );
  }

  private static async saveDoc(doc: any) {
    const response = await ControlBaseService.call("frappe.client.save", {
      doc,
    });
    return response?.message;
  }

  private static async appendChildTaskRow(
    parentDoctype: string,
    parentName: string,
    childDoctype: string,
    data: any,
  ) {
    const doc = await ControlBaseService.getDoc(parentDoctype, parentName);
    doc.tasks = [...(doc.tasks ?? []), { doctype: childDoctype, ...data }];
    return this.saveDoc(doc);
  }

  private static async updateChildTaskRow(
    parentDoctype: string,
    parentName: string,
    rowName: string,
    data: any,
  ) {
    const doc = await ControlBaseService.getDoc(parentDoctype, parentName);
    doc.tasks = (doc.tasks ?? []).map((row: any) =>
      row.name === rowName ? { ...row, ...data } : row,
    );
    return this.saveDoc(doc);
  }

  private static async deleteChildTaskRow(
    parentDoctype: string,
    parentName: string,
    rowName: string,
  ) {
    const doc = await ControlBaseService.getDoc(parentDoctype, parentName);
    doc.tasks = (doc.tasks ?? []).filter((row: any) => row.name !== rowName);
    return this.saveDoc(doc);
  }
}
