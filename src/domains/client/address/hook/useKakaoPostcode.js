const SCRIPT_ID = "kakao-postcode-script";
const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function openPopup(onComplete) {
    new window.daum.Postcode({ oncomplete: onComplete }).open();
}

function loadScriptThenOpen(onComplete) {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
        if (window.daum?.Postcode) {
            openPopup(onComplete);
        } else {
            existing.addEventListener("load", () => openPopup(onComplete), { once: true });
        }
        return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.onload = () => openPopup(onComplete);
    document.head.appendChild(script);
}

/**
 * 카카오 우편번호 API 팝업을 열고 선택된 주소를 콜백으로 반환합니다.
 *
 * onSelect 콜백이 받는 객체:
 * {
 *   zipcode, sido, sigungu, roadName, buildingNumber, buildingName, fullAddress
 * }
 */
export function useKakaoPostcode() {
    const open = (onSelect) => {
        loadScriptThenOpen((data) => {
            const prefix = [data.sido, data.sigungu, data.roadname].filter(Boolean).join(" ") + " ";
            const rest = data.roadAddress.startsWith(prefix)
                ? data.roadAddress.slice(prefix.length)
                : data.roadAddress;
            const buildingNumber = rest.split(" ")[0] ?? "";

            onSelect({
                zipcode: data.zonecode,
                sido: data.sido,
                sigungu: data.sigungu,
                roadName: data.roadname,
                buildingNumber,
                buildingName: data.buildingName ?? "",
                fullAddress: data.roadAddress,
            });
        });
    };

    return { open };
}
