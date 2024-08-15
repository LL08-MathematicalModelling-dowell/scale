import { LinkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { saveAs } from 'file-saver';

const QRCodeCard = ({ imageSrc, instanceName, scaleLink, qrCodeLink, reportLink, loginLink, onClick, type }) => {
  const [alert, setAlert] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const downloadImage = () => {
    saveAs(imageSrc, "qrCode.png"); 
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setAlert("Click to download");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setAlert("");
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setAlert("Copied to clipboard!");
      setTimeout(() => setAlert(""), 3000);
    });
  };

  return (
    <div className="max-w-sm bg-lightblue border border-deepblue shadow-xl rounded-lg overflow-hidden px-2 py-3 cursor-pointer relative">
      <div className="flex items-center flex-col relative">
        <div className="relative">
          <a
            href={imageSrc}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={downloadImage}
          >
            <img
              className="w-36 h-36 my-4"
              src={imageSrc}
              alt="QR Code"
            />
          </a>
        </div>
        <div className="border-t border-[1.3px] w-full border-gray-600 mb-2"></div>
        <div
          className="flex flex-col gap-3"
          onClick={onClick}
        >
          <p className="font-bold text-[14px] flex gap-3 text-left">
            Name: <span className="font-normal">{instanceName}</span>
          </p>
          {type !== "report" && scaleLink && (
            <p className="font-bold text-[14px] flex gap-3">
              Scale link:
              <span
                onClick={() => handleCopy(scaleLink)}
                className="flex text-sm font-normal text-deepblue cursor-pointer"
              >
                <LinkIcon className="w-3" />
                copy link
              </span>
            </p>
          )}
          {qrCodeLink && (
            <p className="font-bold text-[14px] flex gap-3">
              QR Code link:
              <span
                onClick={() => handleCopy(qrCodeLink)}
                className="flex text-sm font-normal text-deepblue cursor-pointer"
              >
                <LinkIcon className="w-3" />
                copy link
              </span>
            </p>
          )}
          {loginLink && (
            <p className="font-bold text-[14px] flex gap-3">
              Login link:
              <span
                onClick={() => handleCopy(loginLink)}
                className="flex text-sm font-normal text-deepblue cursor-pointer"
              >
                <LinkIcon className="w-3" />
                copy link
              </span>
            </p>
          )}
          {type !== "scale" && reportLink && (
            <p className="font-bold text-[14px] flex gap-3">
              Report link:
              <span
                onClick={() => handleCopy(reportLink)}
                className="flex text-sm font-normal text-deepblue cursor-pointer"
              >
                <LinkIcon className="w-3" />
                copy link
              </span>
            </p>
          )}
          
        </div>
      </div>
      {alert && <div className="absolute top-2 right-2 p-2 bg-green-200 text-green-800 rounded">{alert}</div>}
    </div>
  );
};

export default QRCodeCard;
