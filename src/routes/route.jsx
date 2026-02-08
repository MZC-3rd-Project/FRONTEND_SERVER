import {Routes, Route} from "react-router";
import MainLayout from "@/components/layout/MainLayout.jsx";


function CommonRoute(){
    return (<>
        <Routes>
            <Route path="/" element={<MainLayout/>} />
        </Routes>
    </>);
}

export default CommonRoute;