import React, { useState } from 'react';
import CustomHeader from '@/components/CustomHeader/CustomHeader';
import WebsiteContent from '@/components/WebsiteContent/WebsiteContent';
import EmailContent from '@/components/EmailContent/EmailContent';
import SocialMediaContent from '@/components/SocialMediaContent/SocialMediaContent';
import ProductContent from '@/components/ProductContent/ProductContent';
import PrintMediaContent from '@/components/PrintMediaContent/PrintMediaContent';

const platforms = ['Website', 'Email', 'Social Media', 'Product', 'Print Media'];

export default function ShareScale() {
    const [activeTab, setActiveTab] = useState('Website');

    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <CustomHeader />
            <div className="w-full mx-auto p-2 bg-white rounded-lg shadow-md flex flex-col items-center">
                <h1 className="w-full text-center text-2xl text-[#4d625a] font-bold mb-2">Share your scale</h1>
                <p className="w-full text-center text-gray-600 mb-2 text-[#343c6a] font-semibold">You can start sharing your scale on different platforms.</p>
                <div className='w-full mb-4'>
                    <div className="h-[38px] w-[25%] ml-[10rem] flex items-center justify-center rounded-full border border-[#005734] overflow-hidden">
                        <button className='w-[50%] flex items-center justify-center text-sm border-r h-full border-[#005734]'>Raw</button>
                        <button className='w-[50%] flex items-center justify-center text-sm bg-[#D5D5D5] h-full text-[#005734]'>Platform</button>
                    </div>
                </div>

                <div className="w-[60%] border rounded-lg border-[#005734] h-[60vh] overflow-hidden">
                    <div className="flex flex-row items-center justify-start bg-[#E5ECEB] px-2">
                        {platforms.map((platform) => (
                            <button
                                key={platform}
                                className={`py-4 px-4 text-left text-md inline-block border-b-2 ${activeTab === platform
                                    ? 'border-[#005734] text-[#005734] font-bold'
                                    : 'border-transparent text-[#005734]'
                                    } focus:outline-none`}
                                onClick={() => handleTabChange(platform)}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'Website' && <WebsiteContent />}
                    {activeTab === 'Email' && <EmailContent />}
                    {activeTab === 'Social Media' && <SocialMediaContent />}
                    {activeTab === 'Product' && <ProductContent />}
                    {activeTab === 'Print Media' && <PrintMediaContent />}
                </div>

                <div className="mt-6 text-center">
                    <button className="bg-[#005734] text-white px-12 py-2 rounded-lg focus:outline-none">
                        Finish Up
                    </button>
                </div>
            </div>
        </>
    );
}
