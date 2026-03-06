import { MapPin } from "lucide-react";
import { ADDRESS_TYPES } from "@/domains/client/store/constant/constant.js";
import FormField from "@/components/store/FormField.jsx";
import { Input } from "@/components/ui/input.js";

export default function AddressSection({ addresses, onChange }) {
    const update = (type, value) =>
        onChange({ ...addresses, [type]: value });

    return (
        <div className="space-y-4">
            {ADDRESS_TYPES.map(({ value, label, required }) => (
                <FormField key={value} id={`addr-${value}`} label={label} required={required}>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            id={`addr-${value}`}
                            type="text"
                            value={addresses[value] ?? ""}
                            onChange={(e) => update(value, e.target.value)}
                            placeholder={`${label}을 입력하세요`}
                            className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                        />
                    </div>
                </FormField>
            ))}
        </div>
    );
}