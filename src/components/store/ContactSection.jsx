// ── Contact Section ───────────────────────────────────────────────────────────
import FormField from "@/components/store/FormField.jsx";
import {Input} from "@/components/ui/input.js";
import { Mail, Phone } from "lucide-react";

export default function ContactSection({ contacts, onChange }) {
    const update = (type, value) =>
        onChange({ ...contacts, [type]: value });

    return (
        <div className="space-y-4">
            <FormField id="contact-phone" label="전화번호" required>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        id="contact-phone"
                        type="tel"
                        value={contacts.PHONE ?? ""}
                        onChange={(e) => update("PHONE", e.target.value)}
                        placeholder="02-0000-0000"
                        maxLength={20}
                        className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                    />
                </div>
            </FormField>

            <FormField id="contact-email" label="이메일">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        id="contact-email"
                        type="email"
                        value={contacts.EMAIL ?? ""}
                        onChange={(e) => update("EMAIL", e.target.value)}
                        placeholder="store@example.com"
                        className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                    />
                </div>
            </FormField>
        </div>
    );
}