
import {Label} from "@/components/ui/label.js";

export default function FormField({ id, label, required, hint, hintError = false, children }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-semibold text-zinc-600">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {children}
            {hint ? (
                <p className={hintError ? "text-[11px] font-medium text-destructive" : "text-[11px] text-zinc-400"}>
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
