import React, { useState, useEffect } from 'react';
import { FaRegCopy } from "react-icons/fa6";

export default function EmailContent() {
    const [isCopied, setIsCopied] = useState(false);

    const htmlSnippet = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Add your email-specific styling here */
  </style>
</head>
<body>
  <h1>Your Scale</h1>
  <p>Integrate this scale in your email campaigns.</p>
  <p><b>Scale Link:</b> http://example.com/scale</p>
</body>
</html>
`.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlSnippet).then(() => {
            setIsCopied(true);
        }).catch(err => {
            alert("Failed to copy code");
        });
    };

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => {
                setIsCopied(false); 
            }, 3000);
            return () => clearTimeout(timer); 
        }
    }, [isCopied]);

    return (
        <div className="p-4 rounded-lg flex items-center flex-col">
            <div className='w-full'>
                <p className="text-sm text-gray-600 mb-4">
                    Copy the HTML code and integrate it into your email template.
                </p>
            </div>

            <pre className="bg-white p-4 rounded border text-sm overflow-x-auto h-[35vh] w-[80%]">
                <div className='w-full flex items-center justify-end'>
                    <div 
                        className='flex items-center justify-center cursor-pointer border bg-gray-200'
                        onClick={handleCopy}
                    >
                        <p className='mr-2'>{isCopied ? 'Copied' : 'Copy Code'}</p>
                        <FaRegCopy className='cursor-pointer' fontSize={15} />
                    </div>
                </div>
                <code>{htmlSnippet}</code>
            </pre>
        </div>
    );
}
