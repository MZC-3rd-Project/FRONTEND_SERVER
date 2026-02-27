
import { createRoot } from 'react-dom/client'
import './css/index.css'
// import '@/css/reset.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { KeycloakProvider } from '@/common/auth/KeycloakProvider.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <KeycloakProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </KeycloakProvider>
    </QueryClientProvider>
)
