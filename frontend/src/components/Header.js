import React, { useState } from "react";

import Menu from "./Menu";

import { RiMenuLine } from "react-icons/ri";

import {useNavigate} from "react-router-dom";



const Header = ({items, logout}) => {
    const [menuActive, setMenuActive] = useState(false);
    let navigate = useNavigate();

    const goHome = (e) => {
        navigate("/home");
    }

    const clickLi = (e) => {
       if (e.target.innerText === "Выйти") {
            logout();
       }
    }
    return (
        <header className="tw-sticky tw-top-0 tw-bg-white tw-min-h-[40px] tw-z-[1000] tw-w-[100%] tw-border-b tw-border-gray-300">
            <div className="tw-flex tw-mx-4 tw-py-1 tw-relative">
                <div className="tw-group tw-flex tw-cursor-pointer" onClick={goHome}>
                    <div className="group-hover:tw-text-[25px] tw-duration-300 tw-text-2xl tw-text-purple-800 tw-font-brand tw-font-bold tw-tracking-widest">Estate.</div>
                    <div className="group-hover:tw-text-[25px] tw-duration-300 tw-pl-0 tw-text-2xl tw-text-emerald-500 tw-font-brand tw-font-bold tw-tracking-widest">Interview</div>
                </div>
                <ul className="tw-invisible lg:tw-visible tw-flex tw-gap-4 tw-ml-auto tw-my-auto">
                    {items.map(item =>
                        <li key={item.key} className="tw-cursor-pointer" onClick={clickLi}>
                            {item.label === "Выйти" ? 
                            <a className=" tw-text-red-600 tw-rounded-xl tw-p-[5px] hover:tw-no-underline hover:tw-text-red-600 hover:tw-bg-red-300 tw-duration-200" href={item.route}>{item.label}</a> 
                            :
                            <a className=" tw-text-gray-900 tw-rounded-xl tw-p-[5px] hover:tw-no-underline hover:tw-text-green-900 hover:tw-bg-green-300 tw-duration-200" href={item.route}>{item.label}</a> 
                            } 
                        </li>
                    )}     
                </ul>
                <RiMenuLine className="tw-absolute tw-right-1 tw-top-3 tw-visible lg:tw-invisible tw-cursor-pointer tw-my-auto hover:tw-opacity-[50%]" onClick={() => setMenuActive(!menuActive)}/>
            </div>
            <Menu active={menuActive} setActive={setMenuActive} items={items} logout={logout}/>
        </header>
    );
};

export default Header;