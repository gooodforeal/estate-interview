import React from "react";



const Menu = ({items, active, setActive, logout}) => {
    const clickLi = (e) => {
        if (e.target.innerText === "Выйти") {
             logout();
        }
     }
    return (
        <div className={active ? "tw-fixed tw-w-[100vw] tw-h-[100vh] tw-right-0 tw-translate-x-[0%] tw-transition-[0.8s]" : "tw-fixed tw-w-[100vw] tw-h-[100vh] tw-right-0 tw-translate-x-[+100%] tw-transition-[0.8s]"} onClick={() => setActive(false)}>
            <div className="sm:tw-w-[100%] md:tw-w-[30%] lg:tw-w-[30%] tw-bg-white tw-h-[100%] tw-ml-auto tw-p-[30px] tw-transition-[0.8s]" onClick={e => e.stopPropagation}>
                <ul>
                    {items.map(item =>
                        <li key={item.key} className="tw-cursor-pointer tw-mb-5" onClick={clickLi}>
                            <a className=" tw-text-gray-900 hover:tw-no-underline hover:tw-text-gray-400" href={item.route}>{item.label}</a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
 
    );
};

export default Menu;