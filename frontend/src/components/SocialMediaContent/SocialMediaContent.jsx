import React, { useState } from 'react';
import { MdNavigateNext } from "react-icons/md";

export default function SocialMediaContent() {
    const [link, setLink] = useState('http://example.com/scale');

    const handleCopy = () => {
        navigator.clipboard.writeText(link).then(() => {
            alert("Link copied to clipboard!");
        }).catch(err => {
            alert("Failed to copy link");
        });
    };

    return (
        <div className="p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
                Use the master link to add them to your scale.
            </p>
            <div className='w-full h-[35vh] flex items-center justify-center'>
                <div
                    className='p-4 w-[80%] rounded-full border border-[#005734] text-sm flex items-center justify-between'
                    onClick={handleCopy}
                >
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className=""
                    />
                    <MdNavigateNext fontSize={30} />
                </div>
            </div>
            {/* <button
                className="mt-2 bg-[#005734] text-white px-4 py-2 rounded focus:outline-none"
                onClick={handleCopy}
            >
                Copy Link
            </button> */}
        </div>
    );
}
