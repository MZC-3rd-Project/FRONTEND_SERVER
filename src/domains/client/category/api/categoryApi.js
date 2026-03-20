import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchCategoryTree() {
    try {
        const response = await axiosInstance.get("/categories/tree");
        return unwrapApiResponseBody(response, "카테고리 정보를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "카테고리 조회에 실패했습니다.");
    }
}
