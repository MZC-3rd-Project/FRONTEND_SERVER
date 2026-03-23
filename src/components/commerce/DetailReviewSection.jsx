import { ImageIcon, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ratingText(rating) {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(normalizedRating) + "☆".repeat(5 - normalizedRating);
}

function renderReviewImages(images, reviewTitle) {
    if (!Array.isArray(images) || images.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((image) => (
                <img
                    key={image.id}
                    src={image.mediaUrl}
                    alt={reviewTitle || "리뷰 이미지"}
                    className="h-28 w-full rounded-xl object-cover"
                />
            ))}
        </div>
    );
}

export default function DetailReviewSection({
    title = "리뷰",
    averageRating = null,
    reviewCount = 0,
    reviews = [],
    emptyText = "등록된 리뷰가 없습니다.",
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Star className="h-4 w-4 text-primary" />
                        {title}
                    </CardTitle>
                    {reviewCount > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {averageRating !== null ? (
                                <Badge variant="outline" className="rounded-full">
                                    평점 {Number(averageRating).toFixed(1)}
                                </Badge>
                            ) : null}
                            <Badge variant="outline" className="rounded-full">
                                리뷰 {reviewCount.toLocaleString()}개
                            </Badge>
                        </div>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="space-y-3 rounded-2xl border border-border bg-accent/40 p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-foreground">{review.user}</p>
                                    <p className="text-xs text-muted-foreground">{review.createdAtLabel}</p>
                                </div>
                                <span className="text-yellow-500">{ratingText(review.rating)}</span>
                            </div>

                            {review.title ? (
                                <p className="font-medium text-foreground">{review.title}</p>
                            ) : null}
                            <p className="leading-relaxed text-muted-foreground">{review.content || review.comment}</p>

                            {renderReviewImages(review.images, review.title || review.content || review.comment)}

                            {Array.isArray(review.images) && review.images.length > 0 ? (
                                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    리뷰 이미지 {review.images.length}장
                                </div>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                )}
            </CardContent>
        </Card>
    );
}
