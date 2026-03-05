import {Outlet, useLocation} from "react-router";
import Profile from "@/domains/client/profile/page/main/Profile.jsx";

export default function ProfileLayout() {
    const {pathname} = useLocation();
    const isEdit = pathname.endsWith('/edit');

    return (
        <>
            {isEdit  ? <Outlet/> : <Profile/>}
        </>
    )
}