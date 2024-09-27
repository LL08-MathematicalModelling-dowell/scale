// ReportPage.js

import React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const ReportPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-blue-100 to-purple-100">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center mb-6">
                    <AiOutlineInfoCircle className="mr-2 text-5xl text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">We're Sorry for the Inconvenience</h1>
                </div>
                <p className="mb-4 text-lg text-gray-700">
                    We will notify you at your current email when the report is live. It is currently under development.
                </p>
                <p className="mb-6 text-lg text-gray-700">
                    Thank you for staying with us! Meanwhile, you can visit our website to know more about us:
                </p>
                <a 
                    href="https://dowellresearch.sg/" 
                    className="text-lg font-semibold text-blue-600 hover:underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    dowellresearch.sg
                </a>
                <footer className="mt-8 text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} DoWell UX Living Lab
                </footer>
            </div>
        </div>
    );
};

export default ReportPage;
