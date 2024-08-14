import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { FaRegEnvelope } from "react-icons/fa";

const Report = () => {
  const navigate = useNavigate();

  const handleProfileUpdate = () => {
    navigate("/voc/userdetails"); 
  };

  return (
    <div className="max-h-screen max-w-full">
      <Navbar />
      <div className="h-full w-full flex flex-col items-center p-8">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 w-full max-w-2xl mx-auto text-center">
          <FaRegEnvelope className="text-4xl text-blue-500 mb-4 mx-auto" />
          <p className="text-lg font-medium text-gray-800 mb-4">
            Apologies for the inconvenience; the report is currently under development. Thank you for your patience. Meanwhile, you can update your email ID in your user profile, and we will notify you via email when it is ready.
          </p>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={handleProfileUpdate}
          >
            Update Your Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
