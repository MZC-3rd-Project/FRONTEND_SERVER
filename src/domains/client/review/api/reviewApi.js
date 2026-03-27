import axios from "axios";

import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchItemReviews(itemId, params = {}) {
    try {
        const response = await axiosInstance.get(`/v1/reviews/items/${itemId}`, {
            params,
        });

        return unwrapApiResponseBody(response, "리뷰 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "리뷰 목록 조회에 실패했습니다.");
    }
}

export async function createReview(payload) {
    try {
        const response = await axiosInstance.post("/v1/reviews", payload);
        return unwrapApiResponseBody(response, "리뷰 등록에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "리뷰 등록에 실패했습니다.");
    }
}

export async function createReviewImageUploadIntent({ fileName, contentType, fileSize }) {
    try {
        const response = await axiosInstance.post("/v1/media/upload-intents", {
            fileName,
            contentType,
            fileSize,
        });

        return unwrapApiResponseBody(response, "리뷰 이미지 업로드 준비에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "리뷰 이미지 업로드 준비에 실패했습니다.");
    }
}

export async function uploadReviewImageToPresignedUrl({ presignedUrl, file, contentType }) {
    try {
        await axios.put(presignedUrl, file, {
            withCredentials: false,
            headers: contentType ? { "Content-Type": contentType } : undefined,
        });
    } catch (error) {
        throw normalizeApiError(error, "리뷰 이미지 업로드에 실패했습니다.");
    }
}

export async function confirmReviewImageUpload({ mediaId, uploadToken }) {
    try {
        const response = await axiosInstance.post("/v1/media/confirm", {
            mediaId,
            uploadToken,
        });

        return unwrapApiResponseBody(response, "리뷰 이미지 업로드 확인에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "리뷰 이미지 업로드 확인에 실패했습니다.");
    }
}
