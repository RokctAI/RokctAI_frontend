"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { saveDoc } from "@/app/actions/handson/all/crm/crud";
import { DocField, DocTypeMeta } from "@/app/actions/handson/all/crm/meta";
import { Loader2 } from "lucide-react";

interface GenericFormProps {
    doctype: string;
    meta: DocTypeMeta; // Pass meta from server component to avoid client-side fetch waterfall
    defaultValues?: any;
    onSuccess?: (doc: any) => void;
    revalidatePath?: string;
}

export function GenericForm({ doctype, meta, defaultValues, onSuccess, revalidatePath }: GenericFormProps) {
    const [scaffoldFields, setScaffoldFields] = useState<DocField[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
        defaultValues: defaultValues || {}
    });

    useEffect(() => {
        // Filter out irrelevant system fields and hidden fields for the form
        if (meta && meta.fields) {
            const formFields = meta.fields.filter(f =>
                !f.hidden &&
                !f.read_only &&
                !['Section Break', 'Column Break'].includes(f.fieldtype)
            );
            setScaffoldFields(formFields);
        }
    }, [meta]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Clean up data based on types (e.g. checkbox -> 1/0)
            const payload = { ...data };

            const res = await saveDoc(doctype, payload, revalidatePath);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`${doctype} saved successfully`);
                if (onSuccess) onSuccess(res.data);
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: DocField) => {
        const id = field.fieldname;
        const required = field.reqd === 1;

        switch (field.fieldtype) {
            case "Select":
                const options = field.options?.split("\n") || [];
                return (
                    <div key={id} className="space-y-2">
                        <Label htmlFor={id}>{field.label} {required && "*"}</Label>
                        <Select onValueChange={(val) => setValue(id, val)} defaultValue={defaultValues?.[id]}>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );
            case "Text":
            case "Small Text":
            case "Long Text":
                return (
                    <div key={id} className="space-y-2">
                        <Label htmlFor={id}>{field.label} {required && "*"}</Label>
                        <Textarea
                            id={id}
                            placeholder={field.label}
                            {...register(id, { required })}
                        />
                        {errors[id] && <span className="text-sm text-red-500">This field is required</span>}
                    </div>
                );
            case "Check":
                return (
                    <div key={id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id={id}
                            onCheckedChange={(checked: boolean) => setValue(id, checked ? 1 : 0)}
                            defaultChecked={!!defaultValues?.[id]}
                        />
                        <Label htmlFor={id}>{field.label}</Label>
                    </div>
                );
            // Add Date, Int, etc. handlers here as needed
            case "Data":
            default:
                return (
                    <div key={id} className="space-y-2">
                        <Label htmlFor={id}>{field.label} {required && "*"}</Label>
                        <Input
                            id={id}
                            type={field.options === 'Email' ? 'email' : 'text'}
                            placeholder={field.label}
                            {...register(id, { required })}
                        />
                        {errors[id] && <span className="text-sm text-red-500">This field is required</span>}
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scaffoldFields.map(field => renderField(field))}
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save {doctype}
                </Button>
            </div>
        </form>
    );
}
