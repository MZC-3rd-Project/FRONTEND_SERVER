import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Modal({
    open,
    onClose,
    title,
    description,
    children,
    className,
    contentClassName,
}) {
    useEffect(() => {
        if (!open || typeof document === "undefined") {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, open]);

    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
            <button
                type="button"
                aria-label="모달 닫기"
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    "relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-white/95 shadow-[0_32px_120px_rgba(15,23,42,0.28)]",
                    "dark:border-white/10 dark:bg-zinc-950/95",
                    className
                )}
            >
                <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        {title ? <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2> : null}
                        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6", contentClassName)}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

export { Modal };
