import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal.jsx";
import { Textarea } from "@/components/ui/textarea";
import {
    confirmReviewImageUpload,
    createReviewImageUploadIntent,
    uploadReviewImageToPresignedUrl,
} from "@/domains/client/review/api/reviewApi";
import { useCreateReviewMutation } from "@/domains/client/review/query/useReviewQueries";

const MAX_REVIEW_IMAGE_COUNT = 5;
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;

function createLocalImageId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `review-image-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function validateReviewForm({ rating, title, content }) {
    if (!rating) {
        return "평점을 선택해 주세요.";
    }

    if (!title.trim()) {
        return "리뷰 제목을 입력해 주세요.";
    }

    if (!content.trim()) {
        return "리뷰 내용을 입력해 주세요.";
    }

    return null;
}

function validateImageFile(file) {
    if (!file?.type?.startsWith("image/")) {
        return "이미지 파일만 업로드할 수 있습니다.";
    }

    if (file.size > MAX_REVIEW_IMAGE_SIZE) {
        return "이미지는 5MB 이하만 업로드할 수 있습니다.";
    }

    return null;
}

function buildInitialForm() {
    return {
        rating: 0,
        title: "",
        content: "",
    };
}

export default function ReviewWriteModal({ open, onClose, orderId, item, onCreated }) {
    const createReviewMutation = useCreateReviewMutation();
    const [form, setForm] = useState(buildInitialForm);
    const [images, setImages] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const imagesRef = useRef(images);

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => () => {
        imagesRef.current.forEach((image) => {
            if (image.previewUrl) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
    }, []);

    const submitLabel = useMemo(() => {
        if (isUploadingImages) {
            return "이미지 업로드 중...";
        }

        if (createReviewMutation.isPending) {
            return "리뷰 등록 중...";
        }

        return "리뷰 등록";
    }, [createReviewMutation.isPending, isUploadingImages]);

    const handleImageSelect = (event) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length === 0) {
            return;
        }

        const remaining = MAX_REVIEW_IMAGE_COUNT - images.length;
        const nextFiles = selectedFiles.slice(0, remaining);
        const validationError = nextFiles.map(validateImageFile).find(Boolean);
        if (validationError) {
            setImageError(validationError);
            event.target.value = "";
            return;
        }

        const nextImages = nextFiles.map((file) => ({
            id: createLocalImageId(),
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setImages((current) => [...current, ...nextImages]);
        setImageError(null);
        event.target.value = "";
    };

    const handleRemoveImage = (imageId) => {
        setImages((current) => {
            const target = current.find((image) => image.id === imageId);
            if (target?.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return current.filter((image) => image.id !== imageId);
        });
    };

    const uploadImages = async () => {
        const mediaIds = [];

        for (const image of images) {
            const contentType = image.file.type || "application/octet-stream";
            const intent = await createReviewImageUploadIntent({
                fileName: image.file.name,
                contentType,
                fileSize: image.file.size,
            });

            await uploadReviewImageToPresignedUrl({
                presignedUrl: intent.presignedUrl,
                file: image.file,
                contentType,
            });

            const confirmed = await confirmReviewImageUpload({
                mediaId: intent.mediaId,
                uploadToken: intent.uploadToken,
            });

            if (confirmed?.mediaId != null) {
                mediaIds.push(Number(confirmed.mediaId));
            }
        }

        return mediaIds;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError(null);

        const validationError = validateReviewForm(form);
        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        const numericOrderId = Number(orderId);
        const numericItemId = Number(item?.itemId);

        if (!Number.isFinite(numericOrderId) || !Number.isFinite(numericItemId)) {
            setSubmitError("리뷰 대상 상품 정보를 확인할 수 없습니다.");
            return;
        }

        try {
            setIsUploadingImages(true);
            const imageMediaIds = await uploadImages();
            setIsUploadingImages(false);
            const createdReview = await createReviewMutation.mutateAsync({
                orderId: numericOrderId,
                itemId: numericItemId,
                rating: form.rating,
                title: form.title.trim(),
                content: form.content.trim(),
                imageMediaIds,
            });

            onCreated?.(createdReview);
            onClose?.();
        } catch (error) {
            setIsUploadingImages(false);
            setSubmitError(error?.message ?? "리뷰 등록에 실패했습니다.");
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="리뷰 작성"
            description="주문한 상품에 대한 만족도와 사진을 함께 남겨주세요."
            className="max-w-2xl"
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <section className="rounded-3xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                    <div className="flex gap-4">
                        {item?.thumbnail ? (
                            <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="h-20 w-20 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-xs text-zinc-400">
                                이미지 없음
                            </div>
                        )}
                        <div className="min-w-0 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                                Review Target
                            </p>
                            <p className="line-clamp-2 text-base font-bold text-zinc-900">{item?.name}</p>
                            <p className="text-sm text-zinc-500">{item?.storeName || "스토어 정보 없음"}</p>
                            {item?.option ? (
                                <Badge variant="outline" className="mt-1 rounded-full border-zinc-300 bg-white px-3 py-1 text-zinc-600">
                                    {item.option}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-zinc-800">평점</p>
                        <p className="mt-1 text-xs text-zinc-500">별점을 눌러 만족도를 선택해 주세요.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const value = index + 1;
                            const active = value <= form.rating;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    className={`grid h-11 w-11 place-items-center rounded-2xl border transition ${
                                        active
                                            ? "border-amber-300 bg-amber-50 text-amber-500"
                                            : "border-zinc-200 bg-white text-zinc-300 hover:border-amber-200 hover:text-amber-400"
                                    }`}
                                    onClick={() => setForm((current) => ({ ...current, rating: value }))}
                                >
                                    <Star className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
                                </button>
                            );
                        })}
                        <span className="text-sm font-semibold text-zinc-700">
                            {form.rating > 0 ? `${form.rating}점` : "선택 안 됨"}
                        </span>
                    </div>
                </section>

                <section className="space-y-4">
                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-zinc-800">제목</span>
                        <Input
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            placeholder="한 줄로 핵심 후기를 남겨주세요"
                            maxLength={60}
                            className="h-11 rounded-xl border-zinc-200"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-zinc-800">내용</span>
                        <Textarea
                            value={form.content}
                            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                            placeholder="상품 상태, 포장, 배송, 실제 사용 느낌을 구체적으로 적어주세요."
                            maxLength={1000}
                            className="min-h-32 rounded-xl border-zinc-200"
                        />
                        <p className="text-right text-xs text-zinc-400">{form.content.length} / 1000</p>
                    </label>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-zinc-800">리뷰 이미지</p>
                            <p className="mt-1 text-xs text-zinc-500">최대 5장, 이미지당 5MB 이하</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-zinc-300 bg-white px-3 py-1 text-zinc-600">
                            {images.length} / {MAX_REVIEW_IMAGE_COUNT}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {images.map((image) => (
                            <div key={image.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-zinc-200">
                                <img src={image.previewUrl} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    aria-label="이미지 제거"
                                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                                    onClick={() => handleRemoveImage(image.id)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {images.length < MAX_REVIEW_IMAGE_COUNT ? (
                            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition hover:border-zinc-400 hover:bg-zinc-100">
                                <ImagePlus className="h-5 w-5" />
                                <span className="text-[11px] font-semibold">이미지 추가</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                            </label>
                        ) : null}
                    </div>

                    {imageError ? (
                        <p className="text-xs font-medium text-destructive">{imageError}</p>
                    ) : null}
                </section>

                {submitError ? (
                    <Alert variant="destructive">
                        <AlertTitle>리뷰를 등록할 수 없습니다</AlertTitle>
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={onClose}
                        disabled={isUploadingImages || createReviewMutation.isPending}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
                        disabled={isUploadingImages || createReviewMutation.isPending}
                    >
                        {isUploadingImages || createReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
