import { useNavigate } from "react-router";
import { LoaderCircle, MessageCircle, TriangleAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chatKeys, useCreateInquiryRoomMutation } from "@/domains/client/chat/query/useChatQueries";
import { isNumericId } from "@/common/utils/id";

function StickyStoreChat({
    storeName,
    itemId,
    helpText = "상품 상세 맥락을 유지한 채 문의방을 만들고 실시간으로 답변을 받을 수 있어요.",
    disabledReason = "이 화면은 실제 상품 itemId가 없어 문의방을 바로 생성할 수 없습니다.",
}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const createInquiryRoomMutation = useCreateInquiryRoomMutation();

    const canStartInquiry = isNumericId(itemId);

    async function handleStartInquiry() {
        if (!canStartInquiry || createInquiryRoomMutation.isPending) {
            return;
        }

        try {
            const room = await createInquiryRoomMutation.mutateAsync(itemId);
            await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
            navigate(`/my/messages?roomId=${encodeURIComponent(room.roomId)}`);
        } catch (error) {
            if (error?.status === 401) {
                navigate("/auth/login");
            }
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    {storeName} 문의 채팅
                </CardTitle>
                <p className="text-xs text-muted-foreground">{helpText}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-foreground">1:1 문의방 생성 또는 재진입</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                동일 상품 문의 이력이 있으면 기존 방으로 연결됩니다.
                            </p>
                        </div>
                        <Badge variant={canStartInquiry ? "default" : "secondary"}>
                            {canStartInquiry ? "실시간 지원" : "준비 중"}
                        </Badge>
                    </div>
                </div>

                {!canStartInquiry ? (
                    <div className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
                        <p className="inline-flex items-center gap-1.5 font-medium">
                            <TriangleAlert className="h-3.5 w-3.5" />
                            {disabledReason}
                        </p>
                    </div>
                ) : null}

                {createInquiryRoomMutation.isError ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {createInquiryRoomMutation.error?.message ?? "문의방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."}
                    </div>
                ) : null}

                <Button
                    type="button"
                    onClick={handleStartInquiry}
                    disabled={!canStartInquiry || createInquiryRoomMutation.isPending}
                    className="w-full rounded-full"
                >
                    {createInquiryRoomMutation.isPending ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            문의방 여는 중
                        </>
                    ) : (
                        "문의하기"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

export default StickyStoreChat;
