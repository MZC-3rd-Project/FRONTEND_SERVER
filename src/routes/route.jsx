import {Routes, Route} from "react-router";
import MainLayout from "@/components/layout/MainLayout.jsx";
import Home from "@/domains/home/page/Home.jsx";


function CommonRoute(){
    return (<>
        <Routes>
            <Route element={<MainLayout/>} >
                <Route path="/" element={<Home/>}/>
                <Route path="/sub" element={<div>sub</div>}></Route>
            </Route>
        </Routes>
    </>);
}

export default CommonRoute;