export const EMPTY_PROFILE = Object.freeze({
    email: "",
    nickname: "",
    phone: "",
    delivery: "",
    imageUrl: null,
    mediaId: null,
});

function toText(value, fallback = "") {
    if (typeof value === "string") {
        return value;
    }

    if (value == null) {
        return fallback;
    }

    return String(value);
}

function toNullableText(value) {
    const text = toText(value, "").trim();
    return text ? text : null;
}

function toNullableId(value) {
    if (value == null || value === "") {
        return null;
    }

    return typeof value === "string" ? value : String(value);
}

export function normalizeProfile(raw) {
    const image = raw?.image ?? raw?.profileImage ?? raw?.media ?? null;

    return {
        ...EMPTY_PROFILE,
        email: toText(raw?.email),
        nickname: toText(raw?.nickname),
        phone: toText(raw?.phone),
        delivery: toText(raw?.delivery ?? raw?.defaultAddress ?? raw?.address),
        imageUrl: toNullableText(
            raw?.imageUrl ??
                raw?.mediaUrl ??
                raw?.profileImageUrl ??
                image?.mediaUrl ??
                image?.url
        ),
        mediaId: toNullableId(raw?.mediaId ?? raw?.profileImageMediaId ?? image?.mediaId ?? image?.id),
    };
}

export function createProfileFormState(profile = EMPTY_PROFILE) {
    return {
        nickname: toText(profile?.nickname).trim(),
        phone: toText(profile?.phone).trim(),
    };
}

export function buildProfileUpdatePayload({ baseProfile = EMPTY_PROFILE, form, imageChange }) {
    const payload = {};

    if (form.nickname !== createProfileFormState(baseProfile).nickname) {
        payload.nickname = form.nickname;
    }

    if (form.phone !== createProfileFormState(baseProfile).phone) {
        payload.phone = form.phone;
    }

    if (imageChange?.hasChanged) {
        payload.mediaId = imageChange.mediaId;
    }

    return payload;
}
