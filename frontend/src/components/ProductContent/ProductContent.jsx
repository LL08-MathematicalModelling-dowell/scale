import React, { useState, useEffect } from 'react';
import { FaRegCopy } from "react-icons/fa6";

export default function ProductContent() {
    const [isCopied, setIsCopied] = useState(false);

    const codeSnippet = `
import { useState } from "react";

function ProductScale() {
  const [rating, setRating] = useState(0);

  return (
    <div>
      <p>Product Scale Rating: {rating}</p>
      <button onClick={() => setRating(rating + 1)}>Increase Rating</button>
    </div>
  );
}

export default ProductScale;
    `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet).then(() => {
            setIsCopied(true); // Set copied state to true
        }).catch(err => {
            alert("Failed to copy code");
        });
    };

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => {
                setIsCopied(false); // Revert back to "Copy Code" after 3 seconds
            }, 3000);
            return () => clearTimeout(timer); // Clean up the timer
        }
    }, [isCopied]);

    return (
        <div className="p-4 rounded-lg flex items-center flex-col">
            <div className='w-full'>
                <p className="text-sm text-gray-600 mb-4">
                    Copy the source code and integrate it into your Website.
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
                <code>{codeSnippet}</code>
            </pre>
        </div>
    );
}
