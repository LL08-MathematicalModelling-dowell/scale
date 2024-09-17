import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MdOutlineFileDownload } from "react-icons/md";

export default function PrintMediaContent() {
    const qrRef = useRef(null);

    const downloadQRCode = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'qrcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full p-4 rounded-lg w-full flex flex-col items-center justify-start">
            <div className='w-full'>
                <p className="text-sm text-gray-600 mb-4">
                    Use the below generated QR Code Print/Share QR Code on your media platforms
                </p>
            </div>
            <div className='w-max flex items-start'>
                <div className='border-2 border-black' ref={qrRef}>
                    <QRCodeSVG value={window.location.href} size={180} className='m-4' />
                </div>
                <MdOutlineFileDownload fontSize={25} onClick={downloadQRCode}  className='cursor-pointer'/>
            </div>
        </div>
    );
}
