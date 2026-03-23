import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, MapPin, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import AvatarUpload from "@/components/profile/edit/AvartarUpload.jsx";
import FormField from "@/components/profile/edit/FormField.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { profileSchema } from "@/domains/client/profile/actions/schema/schema.js";
import {
    confirmMediaUpload,
    createMediaUploadIntent,
    updateProfile,
    uploadFileToPresignedUrl,
} from "@/domains/client/profile/api/profileApi.js";
import {
    buildProfileUpdatePayload,
    EMPTY_PROFILE,
} from "@/domains/client/profile/lib/profileMappers.js";
import { profileKeys, useProfileQuery } from "@/domains/client/profile/query/useProfileQuery.js";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function formatPhoneInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 3) {
        return digits;
    }

    if (digits.length <= 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }

    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function validateProfileImageFile(file) {
    if (!file) {
        return "업로드할 이미지를 선택해주세요.";
    }

    if (!file.type?.startsWith("image/")) {
        return "이미지 파일만 업로드할 수 있습니다.";
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        return "프로필 이미지는 5MB 이하만 업로드할 수 있습니다.";
    }

    return null;
}

export default function ProfileEditPage() {
    const queryClient = useQueryClient();
    const { data: profile = EMPTY_PROFILE, isLoading, isError, error } = useProfileQuery();

    const [draftForm, setDraftForm] = useState({ nickname: null, phone: null });
    const [previewOverride, setPreviewOverride] = useState(undefined);
    const [imageChange, setImageChange] = useState({ hasChanged: false, mediaId: null });
    const [formErrors, setFormErrors] = useState({});
    const [saveError, setSaveError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const form = {
        nickname: draftForm.nickname ?? profile.nickname,
        phone: draftForm.phone ?? profile.phone,
    };
    const previewUrl = previewOverride !== undefined ? previewOverride : profile.imageUrl;

    const uploadImageMutation = useMutation({
        mutationFn: async (file) => {
            const contentType = file.type || "application/octet-stream";

            const intent = await createMediaUploadIntent({
                fileName: file.name,
                contentType,
                fileSize: file.size,
            });

            await uploadFileToPresignedUrl({
                presignedUrl: intent.presignedUrl,
                file,
                contentType,
            });

            return confirmMediaUpload({
                mediaId: intent.mediaId,
                uploadToken: intent.uploadToken,
            });
        },
    });

    const saveProfileMutation = useMutation({
        mutationFn: (payload) => updateProfile(payload),
    });

    const resetFeedback = () => {
        setSaveError(null);
        setSaveMessage(null);
    };

    const handleFieldChange = (key) => (event) => {
        const nextValue = key === "phone" ? formatPhoneInput(event.target.value) : event.target.value;

        setDraftForm((prev) => ({
            ...prev,
            [key]: nextValue,
        }));
        setFormErrors((prev) => ({
            ...prev,
            [key]: undefined,
        }));
        resetFeedback();
    };

    const handleImageChange = async (_dataUrl, file) => {
        const validationError = validateProfileImageFile(file);

        if (validationError) {
            setUploadError(validationError);
            return;
        }

        setUploadError(null);
        resetFeedback();

        try {
            const confirmedMedia = await uploadImageMutation.mutateAsync(file);

            setPreviewOverride(confirmedMedia?.mediaUrl ?? null);
            setImageChange({
                hasChanged: true,
                mediaId: confirmedMedia?.mediaId != null ? String(confirmedMedia.mediaId) : null,
            });
        } catch (uploadFailure) {
            setUploadError(uploadFailure.message ?? "프로필 이미지 업로드에 실패했습니다.");
        }
    };

    const handleImageRemove = () => {
        setUploadError(null);
        resetFeedback();
        setPreviewOverride(null);
        setImageChange({
            hasChanged: true,
            mediaId: null,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        resetFeedback();
        setFormErrors({});

        const validationResult = profileSchema.safeParse(form);

        if (!validationResult.success) {
            setFormErrors(validationResult.error.flatten().fieldErrors);
            return;
        }

        if (uploadImageMutation.isPending) {
            setSaveError("프로필 이미지 업로드가 끝난 뒤 저장할 수 있습니다.");
            return;
        }

        const payload = buildProfileUpdatePayload({
            baseProfile: profile,
            form: validationResult.data,
            imageChange,
        });

        if (Object.keys(payload).length === 0) {
            setSaveMessage("변경된 내용이 없습니다.");
            return;
        }

        try {
            await saveProfileMutation.mutateAsync(payload);

            const nextProfile = {
                ...profile,
                nickname: validationResult.data.nickname,
                phone: validationResult.data.phone,
                imageUrl: imageChange.hasChanged ? previewUrl : profile.imageUrl,
                mediaId: imageChange.hasChanged ? imageChange.mediaId : profile.mediaId,
            };

            queryClient.setQueryData(profileKeys.me(), nextProfile);
            setDraftForm({ nickname: null, phone: null });
            setPreviewOverride(undefined);
            setImageChange({
                hasChanged: false,
                mediaId: nextProfile.mediaId,
            });
            setSaveMessage("프로필이 저장되었습니다.");
        } catch (saveFailure) {
            setSaveError(saveFailure.message ?? "프로필 저장에 실패했습니다.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-5 pb-10 max-w-2xl mx-auto">
                <div className="animate-pulse bg-muted rounded-[2rem] h-48" />
                <div className="animate-pulse bg-muted rounded-3xl h-40" />
                <div className="animate-pulse bg-muted rounded-3xl h-64" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-2xl mx-auto space-y-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {error?.message ?? "프로필 정보를 불러오지 못했습니다."}
                </p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link to="/my/profile">프로필로 돌아가기</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-full flex-shrink-0">
                    <Link to="/my/profile">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <p className="text-xs font-semibold text-muted-foreground">My Account</p>
                    <h1 className="text-2xl font-black text-foreground leading-tight">프로필 수정</h1>
                </div>
            </div>

            <section className="bg-card border border-border rounded-3xl p-8 text-center">
                <AvatarUpload
                    imageUrl={previewUrl}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                    disabled={uploadImageMutation.isPending}
                    statusText={uploadImageMutation.isPending ? "이미지를 업로드하고 있습니다." : null}
                    errorText={uploadError}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                    이미지는 선택 즉시 업로드 후 확인까지 마치고, 저장 시 최종 mediaId만 프로필에 반영합니다.
                </p>
            </section>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <User className="w-4 h-4" />
                            기본 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <FormField
                            id="email"
                            label="이메일"
                            hint="이메일 변경은 프로필 저장과 분리되어 있어 이 화면에서는 수정하지 않습니다."
                        >
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="h-11 rounded-xl pl-9"
                                />
                            </div>
                        </FormField>

                        <FormField
                            id="nickname"
                            label="닉네임"
                            required
                            hint={formErrors?.nickname?.[0]}
                            hintError={Boolean(formErrors?.nickname)}
                        >
                            <Input
                                id="nickname"
                                type="text"
                                value={form.nickname}
                                onChange={handleFieldChange("nickname")}
                                placeholder="사용할 닉네임을 입력하세요"
                                maxLength={20}
                                className="h-11 rounded-xl"
                            />
                        </FormField>

                        <FormField
                            id="phone"
                            label="전화번호"
                            required
                            hint={formErrors?.phone?.[0]}
                            hintError={Boolean(formErrors?.phone)}
                        >
                            <Input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleFieldChange("phone")}
                                placeholder="010-0000-0000"
                                maxLength={13}
                                className="h-11 rounded-xl"
                            />
                        </FormField>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            배송 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FormField
                            id="delivery"
                            label="기본 배송지"
                            hint="배송지 변경은 배송지 관리 화면에서 처리합니다."
                        >
                            <Input
                                id="delivery"
                                type="text"
                                value={profile.delivery}
                                disabled
                                placeholder="등록된 기본 배송지가 없습니다."
                                className="h-11 rounded-xl"
                            />
                        </FormField>
                        <Button asChild variant="ghost" className="h-8 rounded-full px-3">
                            <Link to="/my/addresses">배송지 관리로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1 h-12 rounded-full font-bold">
                        <Link to="/my/profile">취소</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={saveProfileMutation.isPending || uploadImageMutation.isPending}
                        className="flex-[2] h-12 rounded-full font-bold"
                    >
                        {saveProfileMutation.isPending ? "저장 중..." : "저장하기"}
                    </Button>
                </div>
            </form>

            {saveMessage ? <p className="text-sm text-primary font-semibold text-center">{saveMessage}</p> : null}
            {saveError ? <p className="text-sm text-destructive font-semibold text-center">{saveError}</p> : null}
        </div>
    );
}
