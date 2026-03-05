import {useRef} from "react";
import {Button} from "@/components/ui/button.js";
import { Camera, Trash2, Upload, User } from "lucide-react";

export default function AvatarUpload({ imageUrl, onImageChange, onImageRemove }) {
    const fileRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onImageChange(ev.target.result, file);
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar circle */}
            <div
                className="relative w-24 h-24 cursor-pointer group"
                onClick={() => fileRef.current?.click()}
            >
                <div className="w-24 h-24 rounded-full border-[3px] border-white/90 shadow-[0_8px_32px_rgba(31,38,66,0.18)] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
                    )}
                </div>
                {/* hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-zinc-300 bg-white text-zinc-700 text-xs font-semibold px-4 hover:bg-zinc-100"
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload className="w-3 h-3" />
                    이미지 업로드
                </Button>
                {imageUrl && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full border-red-200 bg-red-50 text-red-500 text-xs font-semibold px-4 hover:bg-red-100"
                        onClick={onImageRemove}
                    >
                        <Trash2 className="w-3 h-3" />
                        삭제
                    </Button>
                )}
            </div>
            <p className="text-[11px] text-zinc-400">JPG, PNG, WEBP · 최대 5MB</p>
        </div>
    );
}