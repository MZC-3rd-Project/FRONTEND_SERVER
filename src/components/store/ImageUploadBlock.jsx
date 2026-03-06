import {useRef} from "react";
import {Badge} from "@/components/ui/badge.js";
import {ImagePlus, X} from "lucide-react";
import {Button} from "@/components/ui/button.js";
import {makeid} from "@/domains/client/store/constant/constant.js";
import {Input} from "@/components/ui/input.js";

export default function ImageUploadBlock({ label, desc, maxCount, images, onChange }) {
    const fileRef = useRef(null);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = maxCount - images.length;
        const toAdd = files.slice(0, remaining).map((file) => ({
            id: makeid(),
            file,
            preview: URL.createObjectURL(file),
        }));
        onChange([...images, ...toAdd]);
        e.target.value = "";
    };

    const remove = (id) => onChange(images.filter((img) => img.id !== id));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-zinc-700">{label}</p>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-200">
                    {images.length} / {maxCount}
                </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                    <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 group">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => remove(img.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {images.length < maxCount && (
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                        <ImagePlus className="w-5 h-5 text-zinc-400" />
                        <span className="text-[10px] text-zinc-400 font-medium">추가</span>
                    </button>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={maxCount > 1}
                className="hidden"
                onChange={handleFiles}
            />
        </div>
    );
}