import React, { useState, useEffect } from 'react';
import { FaRegCopy } from "react-icons/fa6";

export default function WebsiteContent() {
    const [isCopied, setIsCopied] = useState(false);

    const codeSnippet = `
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
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
                    Copy the source code and integrate it into your website.
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
