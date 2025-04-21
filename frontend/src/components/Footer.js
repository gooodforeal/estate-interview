import React from "react";


const Footer = () => {
  return (
    <div className="tw-w-[100%] md:tw-w-[50%] tw-bg-gradient-to-r tw-from-emerald-500 tw-to-emerald-600 tw-rounded-t-[50px] tw-mx-auto tw-shadow-lg tw-mt-10">
        <div className="lg:tw-flex tw-pt-[20px] tw-text-white">
        <div className="tw-mx-auto tw-text-center lg:tw-my-auto tw-mb-3 tw-text-2xl tw-font-bold tw-tracking-wider">
            Estate.Interview
        </div>
        <div className="tw-mx-auto tw-mb-3 tw-text-center">
            <div className="tw-font-semibold tw-tracking-wider">Ссылки</div>
            <div className="tw-text-[14px]">
            <a href="/#" className="tw-text-gray-300 hover:tw-text-gray-900 hover:tw-no-underline">Github</a>
            </div>
        </div>
        <div className="tw-mx-auto tw-mb-3 tw-text-center">
            <div className="tw-font-semibold tw-tracking-wider">Связаться с нами</div>
            <div className="tw-text-[14px]">
            <a href="/#" className="tw-text-gray-300 hover:tw-text-gray-900 hover:tw-no-underline">Telegram</a>
            </div>
        </div>
        </div>
        <div className="tw-text-center tw-mt-[20px] tw-text-[12px]">© Timothy Guslao</div>
    </div>
  );
};

export default Footer;