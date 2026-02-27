import { createContext, useContext, useEffect, useState } from "react";
import keycloak from "./keycloak";

const KeycloakContext = createContext(null);

export function KeycloakProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        keycloak
            .init({
                onLoad: "check-sso",
                silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
            })
            .then((auth) => {
                setAuthenticated(auth);
                setLoading(false);

                keycloak.onTokenExpired = () => {
                    keycloak.updateToken(70).then((refreshed) => {
                        if (refreshed) console.log("Token refreshed");
                    });
                };
            })
            .catch((err) => {
                console.error("Keycloak initialization failed", err);
                setLoading(false);
            });
    }, []);

    const value = {
        keycloak,
        authenticated,
        loading,
        login: (options) => keycloak.login(options),
        logout: () => keycloak.logout({ redirectUri: window.location.origin + "/" }),
    };

    if (loading) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">인증 확인 중...</div>;

    return (
        <KeycloakContext.Provider value={value}>
            {children}
        </KeycloakContext.Provider>
    );
}

export function useKeycloak() {
    return useContext(KeycloakContext);
}
