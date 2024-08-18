import Navbar from "../../components/Navbar/Navbar";
import profileLogo from "../../assets/profile.png";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { useRef, useState, useEffect } from "react";
import { decodeToken } from "../../utils/tokenUtils";
import { updateUserDetails } from "../../services/api.services";

const UserDetails = () => {
  const inputRef = useRef(null);
  const emailRef = useRef(null);
  const [image, setImage] = useState(() => localStorage.getItem("profileImage"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");
  const [userData, setUserData] = useState({});

  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    if (token) {
      const decodedToken = decodeToken(token);
      setUserData({
        portfolio: decodedToken.portfolio,
        email: decodedToken.email,
        profileImage: decodedToken.profile_image,
        workspaceOwnerName: decodedToken.workspace_owner_name,
        portfolioUsername: decodedToken.portfolio_username,
        memberType: decodedToken.member_type,
        dataType: decodedToken.data_type,
        operationsRight: decodedToken.operations_right,
        status: decodedToken.status
      });
    }
  }, [token]);

  useEffect(() => {
    if (image) {
      localStorage.setItem("profileImage", image);
    }
  }, [image]);

  useEffect(() => {
    if (!userData.email && emailRef.current) {
      emailRef.current.focus();
    }
  }, [userData.email]);

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setMessage("Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlert("");
  
    try {
      const userId = token ? decodeToken(token)._id : null; 
      const response = await updateUserDetails(userId, {
        email: userData.email
      });
  
      if (response.data.success) { 
        setAlert("Changes saved successfully!");
      } else {
        setAlert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      setAlert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(""), 3000);
    }
  };    

  return (
    <div className="max-h-screen max-w-full">
      <Navbar />
      <div className="flex flex-col md:flex-row md:p-12 p-2 h-full">
        {/* Left side */}
        <div className="flex flex-col items-center mt-5 md:w-2/5 w-full mb-6">
          <div className="border border-semiblue rounded-full w-52 h-52">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <img
                src={profileLogo}
                alt="Profile Placeholder"
                className="rounded-full w-full h-full object-cover p-3"
              />
            )}
          </div>
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            onClick={handleImageClick}
            className="flex items-center text-[18px] font-semibold gap-2 bg-lightblue mt-4 px-4 rounded-xl py-1 border-[0.5px] border-deepblue text-deepblue"
          >
            <PencilSquareIcon className="w-5 text-[#0079E3]" /> Edit
          </button>
          {message && (
            <div className="mt-3 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>
        {/* Right side */}
        <div className="flex flex-col md:w-3/5 w-full md:pl-8 p-4">
          <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Portfolio</label>
              <input
                type="text"
                name="portfolio"
                value={userData.portfolio || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email || ''}
                onChange={handleChange}
                ref={emailRef}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Workspace Owner Name</label>
              <input
                type="text"
                name="workspaceOwnerName"
                value={userData.workspaceOwnerName || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Portfolio Username</label>
              <input
                type="text"
                name="portfolioUsername"
                value={userData.portfolioUsername || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="font-medium text-gray-700">Member Type</label>
              <input
                type="text"
                name="memberType"
                value={userData.memberType || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Data Type</label>
              <input
                type="text"
                name="dataType"
                value={userData.dataType || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Operations Right</label>
              <input
                type="text"
                name="operationsRight"
                value={userData.operationsRight || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700">Status</label>
              <input
                type="text"
                name="status"
                value={userData.status || ''}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <button
              type="submit"
              className={`w-40 py-2 text-sm font-semibold rounded-md mt-4 bg-blue-500 ${loading ? "bg-lightblue cursor-not-allowed text-black" : "bg-deepblue text-white"
                }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
            {alert && (
              <div className="mt-3 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium">{alert}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
