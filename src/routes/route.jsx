import { Route, Routes } from "react-router";

import MainLayout from "@/components/layout/MainLayout.jsx";

import Home from "@/domains/home/page/Home.jsx";
import FundingListPage from "@/domains/client/funding/page/FundingListPage.jsx";
import FundingDetailPage from "@/domains/client/funding/page/FundingDetailPage.jsx";
import StorePage from "@/domains/client/store/page/StorePage.jsx";
import StoreDetailPage from "@/domains/client/store/page/StoreDetailPage.jsx";
import DealsPage from "@/domains/client/deals/page/DealsPage.jsx";
import SellerCenterPage from "@/domains/client/seller/page/SellerCenterPage.jsx";
import CartPage from "@/domains/client/cart/page/CartPage.jsx";
import MyPage from "@/domains/client/account/page/MyPage.jsx";
import NotificationsPage from "@/domains/client/notifications/page/NotificationsPage.jsx";
import MessagesPage from "@/domains/client/messages/page/MessagesPage.jsx";
import SearchResultPage from "@/domains/client/search/page/SearchResultPage.jsx";
import LoginPage from "@/domains/client/auth/page/LoginPage.jsx";
import JoinPage from "@/domains/client/auth/page/JoinPage.jsx";

import NotFoundPage from "@/domains/common/page/NotFoundPage.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/funding" element={<FundingListPage />} />
                <Route path="/funding/:campaignId" element={<FundingDetailPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/store/:storeId" element={<StoreDetailPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/seller" element={<SellerCenterPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/my" element={<MyPage />} />
                <Route path="/my/notifications" element={<NotificationsPage />} />
                <Route path="/my/messages" element={<MessagesPage />} />
                <Route path="/search" element={<SearchResultPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/join" element={<JoinPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
