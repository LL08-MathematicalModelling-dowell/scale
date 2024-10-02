import { useState } from "react";
import { HiMiniPencilSquare } from "react-icons/hi2";
import PropTypes from "prop-types";
import { IoCopyOutline } from "react-icons/io5";

const LLXCard = ({ instance, qrcode, onInstanceNameChange, scaleLink, qrcodeImageUrl, type, reportLink, LoginLink }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState(instance);
  const [alert, setAlert] = useState(false)
  const [msg, setMsg] = useState(" ")

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setNewInstanceName(e.target.value);
  };

  const handleSaveInstanceName = () => {
    setIsEditing(false);
    if (newInstanceName.trim() !== "") {
      onInstanceNameChange(newInstanceName);
    }
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setAlert(true); // Set alert state to true
      setMsg("Copied to clipboard!");
      setTimeout(() => setAlert(false), 3000);
    });
  };

  return (
    <div className="max-w-full bg-green-100 border border-green-800 shadow-xl rounded-lg overflow-hidden px-2 py-3 cursor-pointer relative">
      {/* QR CODE IMAGE */}
      <div>
        <img src={qrcode} alt="QR code" />
      </div>
      <div className="flex flex-col mt-3 gap-3">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={newInstanceName}
              onChange={handleInputChange}
              onBlur={handleSaveInstanceName} 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveInstanceName();
                }
              }}
              className="border-b border-gray-400 bg-transparent focus:outline-none text-md md:text-[14px] font-poppins py-1 pl-2"
              autoFocus
            />
          ) : (
            <>
              <h1 className="font-medium font-poppins tracking-tight text-md md:text-[14px]">Name: {type === "report" ? "Report"  : type === 'login' ? "Login" : `${instance}`}</h1>
              {/* EDIT ICON */}
              <HiMiniPencilSquare className="cursor-pointer" onClick={handleEditClick} />
            </>
          )}

          {alert && (
            <div className="absolute top-0 right-0 bg-green-800 text-white text-[13px] px-2 py-1 rounded-sm font-poppins tracking-tight">{msg}</div>
          )}

        </div>
      <div className={`flex gap-2 items-center  ${type === "report" ? "block" : "hidden"}`}>
      <p className={`font-medium font-poppins tracking-tight text-md md:text-[14px]`}>Report Link: </p>
      <IoCopyOutline className="text-green-800"    onClick={() => handleCopy(reportLink)} />
      </div>
      <div className={`flex gap-2 items-center  ${type === "session" ? "block" : "hidden"}`}>
      <p className={`font-medium font-poppins tracking-tight text-md md:text-[14px]`}>Scale Link: </p>
      <IoCopyOutline className="text-green-800"    onClick={() => handleCopy(scaleLink)} />
      </div>
      <div className={`flex gap-2 items-center  ${type === "login" ? "block" : "hidden"}`}>
      <p className={`font-medium font-poppins tracking-tight text-md md:text-[14px]`}>Login Link: </p>
      <IoCopyOutline className="text-green-800"    onClick={() => handleCopy(LoginLink)} />
      </div>
      <div className="flex gap-2 items-center">
      <p className="font-medium font-poppins tracking-tight text-md md:text-[14px]">QR Code:  </p>
      <IoCopyOutline className="text-green-800"  onClick={() => handleCopy(qrcodeImageUrl)}/>
      </div>
      </div>
    </div>
  );
};

LLXCard.propTypes = {
  instance: PropTypes.string.isRequired,
  qrcode: PropTypes.string.isRequired,
  onInstanceNameChange: PropTypes.func.isRequired,
  scaleLink: PropTypes.string.isRequired,
  qrcodeImageUrl: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  reportLink: PropTypes.string.isRequired,
  LoginLink: PropTypes.string.isRequired,
};

export default LLXCard;
