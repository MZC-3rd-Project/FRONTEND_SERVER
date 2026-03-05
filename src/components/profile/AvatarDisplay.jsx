import {ShieldCheck, User} from "lucide-react";

export default function AvatarDisplay({ imageUrl, size = "lg" }) {
    const dim = size === "lg" ? "w-24 h-24" : "w-16 h-16";
    const iconDim = size === "lg" ? "w-10 h-10" : "w-7 h-7";

    return (
        <div className={`relative ${dim} flex-shrink-0`}>
            <div
                className={`${dim} rounded-full border-[3px] border-white/90 shadow-[0_8px_32px_rgba(31,38,66,0.18)] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center`}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                    <User className={`${iconDim} text-zinc-400`} strokeWidth={1.5} />
                )}
            </div>
            {/* verified badge */}
            <span className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-cyan-300" />
            </span>
        </div>
    );
}