// import {useState, useEffect} from "react";
// import {useNavigate} from "react-router-dom";
// import Logo from "../../assets/VOC.png";
// import CircularProgress from "@mui/material/CircularProgress";
// import {sendOtpServices, validateOtpServices, emailServiceForUserDetails} from "../../services/api.services";
// import Pattern from "../../assets/Pattern.png";
// import { Carousel } from 'react-responsive-carousel';
// import "react-responsive-carousel/lib/styles/carousel.min.css";
// import step1 from '../../assets/Step-1.svg'

// const Registration = () => {
//   const [email, setEmail] = useState("");
//   const [userId, setUserId] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpValidated, setOtpValidated] = useState(false);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const navigate = useNavigate();

//   const queryParams = new URLSearchParams(location.search);
//   let workspaceName = queryParams.get("workspace_name");

//   if (!workspaceName) {
//     workspaceName = "VOCABC";
//   }

//   useEffect(() => {
//     // Get user's current location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLatitude(position.coords.latitude);
//           setLongitude(position.coords.longitude);
//         },
//         (error) => {
//           console.log("Error getting location:", error);
//           setStatusMessage("Failed to get location. Please ensure location services are enabled.");
//           setIsSuccess(false);
//         }
//       );
//     } else {
//       console.log("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   const handleEmailChange = (e) => setEmail(e.target.value);
//   const handleUserIdChange = (e) => setUserId(e.target.value);
//   const handleOtpChange = (e) => setOtp(e.target.value);

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await sendOtpServices(email, userId);
//       if (response.data.success) {
//         setStatusMessage(response.data.message);
//         setIsSuccess(true);
//         setOtpSent(true);
//       } else {
//         setStatusMessage(response.data.message || "Failed to send OTP. Please try again.");
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to send OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleValidateOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await validateOtpServices(email, userId, otp);
//       if (response.data.success) {
//         setStatusMessage("OTP validated successfully.");
//         setIsSuccess(true);
//         setOtpValidated(true);
//       } else {
//         setStatusMessage(response.data.message || "Failed to validate OTP. Please try again.");
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to validate OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendEmail = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await emailServiceForUserDetails(email, userId, latitude, longitude, workspaceName);
//       if (response.data.success) {
//         setStatusMessage(response.data.message);
//         setIsSuccess(true);
//         const timeoutId = setTimeout(() => {
//           navigate("/voc");
//         }, 2000);

//         // Clear timeout if component unmounts
//         return () => clearTimeout(timeoutId);
//       } else {
//         setStatusMessage(response.data.message);
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage = error.response?.data?.message;
//       setStatusMessage(errorMessage);
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleHome = () => navigate("/voc");

//   return (
//     <div className="min-h-screen max-w-full flex">
//       {/* Left */}
//       <div
//         className="w-1/2 bg-white  flex justify-center items-center"
//         style={{
//           backgroundImage: `url(${Pattern})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* Carousel */}
//         <Carousel
//          showThumbs={false}
//          infiniteLoop={true}
//          autoPlay={true}
//          interval={3000}
//          stopOnHover={false}
//          showStatus={false}
//         >
//           <img src={step1} alt="" />
//           <img src={step1} alt="" />
//           <img src={step1} alt="" />
//         </Carousel>
//       </div>

//       {/* right */}
//       <div className="w-1/2  flex flex-col justify-center items-center">
//         <img src={Logo} className="w-48 h-auto mb-8" alt="VOC Logo" />
//         <form className="w-full max-w-sm flex flex-col gap-4 items-center" onSubmit={otpValidated ? handleSendEmail : otpSent ? handleValidateOtp : handleSendOtp}>
//           <input type="text" name="userId" placeholder="Enter your User ID" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={userId} onChange={handleUserIdChange} />
//           <input type="email" name="email" placeholder="Enter your email" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={email} onChange={handleEmailChange} />

//           {otpSent && !otpValidated && <input type="text" name="otp" placeholder="Enter the OTP" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={otp} onChange={handleOtpChange} />}

//           <div className="w-full flex gap-4">
//             <button type="button" className="w-full py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300" onClick={handleHome}>
//               Cancel
//             </button>
//             <button type="submit" className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${loading ? "bg-blue-300 cursor-not-allowed text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}`} disabled={loading}>
//               {loading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <CircularProgress color="inherit" size={20} />
//                   {otpValidated ? "Sending Email..." : otpSent ? "Verifying OTP..." : "Sending OTP..."}
//                 </div>
//               ) : otpValidated ? (
//                 "Submit"
//               ) : otpSent ? (
//                 "Verify OTP"
//               ) : (
//                 "Send OTP"
//               )}
//             </button>
//           </div>

//           {statusMessage && <p className={`mt-2 text-center font-semibold ${isSuccess ? "text-blue-600" : "text-red-600"}`}>{statusMessage}</p>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Registration;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Logo from "../../assets/VOC.png";
// import CircularProgress from "@mui/material/CircularProgress";
// import {sendOtpServices, validateOtpServices, emailServiceForUserDetails} from "../../services/api.services";
// import Pattern from "../../assets/Pattern.png";
// import { Carousel } from 'react-responsive-carousel';
// import "react-responsive-carousel/lib/styles/carousel.min.css";
// import step1 from '../../assets/Step-1.svg'
// import step2 from '../../assets/Step-2.svg'
// import step3 from '../../assets/Step-3.svg'
// import step4 from '../../assets/Step-4.svg'
// import step5 from '../../assets/Step-5.svg'
// import process from '../../assets/process.svg'

// const Registration = () => {
//   const [email, setEmail] = useState("");
//   const [userId, setUserId] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpValidated, setOtpValidated] = useState(false);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const navigate = useNavigate();

//   const queryParams = new URLSearchParams(location.search);
//   let workspaceName = queryParams.get("workspace_name");

//   if (!workspaceName) {
//     workspaceName = "VOCABC";
//   }

//   useEffect(() => {
//     // Get user's current location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLatitude(position.coords.latitude);
//           setLongitude(position.coords.longitude);
//         },
//         (error) => {
//           console.log("Error getting location:", error);
//           setStatusMessage("Failed to get location. Please ensure location services are enabled.");
//           setIsSuccess(false);
//         }
//       );
//     } else {
//       console.log("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   const handleEmailChange = (e) => setEmail(e.target.value);
//   const handleUserIdChange = (e) => setUserId(e.target.value);
//   const handleOtpChange = (e) => setOtp(e.target.value);

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await sendOtpServices(email, userId);
//       if (response.data.success) {
//         setStatusMessage(response.data.message);
//         setIsSuccess(true);
//         setOtpSent(true);
//       } else {
//         setStatusMessage(response.data.message || "Failed to send OTP. Please try again.");
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to send OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleValidateOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await validateOtpServices(email, userId, otp);
//       if (response.data.success) {
//         setStatusMessage("OTP validated successfully.");
//         setIsSuccess(true);
//         setOtpValidated(true);
//       } else {
//         setStatusMessage(response.data.message || "Failed to validate OTP. Please try again.");
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to validate OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendEmail = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//         const response = await emailServiceForUserDetails(email, userId, latitude, longitude, workspaceName);
//         if (response.data.success) {
//             setStatusMessage(response.data.message);
//             setIsSuccess(true);
//             const timeoutId = setTimeout(() => {
//                 navigate("/voc");
//             }, 2000);

//             // Clear timeout if component unmounts
//             return () => clearTimeout(timeoutId);
//         } else {
//             setStatusMessage(response.data.message);
//             setIsSuccess(false);
//         }
//     } catch (error) {
//         console.error(error);
//         const errorMessage = error.response?.data?.message;
//         setStatusMessage(errorMessage);
//         setIsSuccess(false);
//     } finally {
//         setLoading(false);
//     }
// };

//   const handleHome = () => navigate("/voc");

//   return (
//     <div className="min-h-screen max-w-full flex md:flex-row flex-col">
//       {/* Left */}
//       <div
//         className="md:w-1/2  h-[400px] md:h-screen  w-full bg-white  flex justify-center items-center flex-col"
//         style={{
//           backgroundImage: `url(${Pattern})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >

//         <div className="flex flex-col justify-center items-center gap-3 px-14 ">
//           <h1 className="text-3xl font-bold text-white font-poppins tracking-tight">Welcome to VOC!</h1>
//           <p className="text-md mb-8 font-poppins tracking-tight text-gray-300 text-center">
//          We’re excited to have you on board. Let’s dive into powerful insights and seamless reporting with just a few clicks.
//           </p>
//         </div>
//         {/* Carousel */}
//         <Carousel className="md:w-[240px]  w-[100px]"
//          showThumbs={true}
//          infiniteLoop={true}
//          autoPlay={true}
//          interval={3000}
//          stopOnHover={true}
//          showStatus={false}
//         >
//           <img src={step1} alt="" />
//           <img src={step2} alt="" />
//           <img src={step3} alt="" />
//           <img src={step4} alt="" />
//           <img src={step5} alt="" />
//           <img src={process} alt="" />
//         </Carousel>
//       </div>

//       {/* right */}
//       <div className="w-full mb-10 md:mb-0 md:w-1/2  flex flex-col justify-center items-center">
//         <img src={Logo} className="w-48 h-auto mb-8" alt="VOC Logo" />
//         <form className="w-full max-w-sm flex flex-col gap-4 items-center" onSubmit={otpValidated ? handleSendEmail : otpSent ? handleValidateOtp : handleSendOtp}>
//           <input type="text" name="userId" placeholder="Enter your User ID" className="bg-white border font-poppins tracking-tight border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={userId} onChange={handleUserIdChange} />
//           <input type="email" name="email" placeholder="Enter your email" className="bg-white border font-poppins tracking-tight border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={email} onChange={handleEmailChange} />

//         <div className="w-full flex gap-4">
//           <button
//             type="button"
//             className="w-full py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300"
//             onClick={handleHome}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
//               loading
//                 ? "bg-blue-300 cursor-not-allowed text-gray-700"
//                 : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//             disabled={loading}
//           >
//             {loading ? (
//               <div className="flex items-center justify-center gap-2">
//                 <CircularProgress color="inherit" size={20} />
//                 {otpValidated
//                   ? "Sending Email..."
//                   : otpSent
//                   ? "Verifying OTP..."
//                   : "Sending OTP..."}
//               </div>
//             ) : otpValidated ? (
//               "Submit"
//             ) : otpSent ? (
//               "Verify OTP"
//             ) : (
//               "Send OTP"
//             )}
//           </button>
//         </div>

//           <div className="w-full flex gap-4">
//             <button type="button" className="w-full font-poppins tracking-tight py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300" onClick={handleHome}>
//               Cancel
//             </button>
//             <button type="submit" className={`w-full font-poppins tracking-tight py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${loading ? "bg-blue-300 cursor-not-allowed text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}`} disabled={loading}>
//               {loading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <CircularProgress color="inherit" size={20} />
//                   {otpValidated ? "Sending Email..." : otpSent ? "Verifying OTP..." : "Sending OTP..."}
//                 </div>
//               ) : otpValidated ? (
//                 "Submit"
//               ) : otpSent ? (
//                 "Verify OTP"
//               ) : (
//                 "Send OTP"
//               )}
//             </button>
//           </div>

//           {statusMessage && <p className={`mt-2 text-center font-semibold ${isSuccess ? "text-blue-600" : "text-red-600"}`}>{statusMessage}</p>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Registration;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Logo from "../../assets/VOC.png";
// import CircularProgress from "@mui/material/CircularProgress";
// import {
//   sendOtpServices,
//   validateOtpServices,
//   emailServiceForUserDetails,
// } from "../../services/api.services";

// const Registration = () => {
//   const [email, setEmail] = useState("");
//   const [userId, setUserId] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [otpSent, setOtpSent] = useState(true);
//   const [otpValidated, setOtpValidated] = useState(true);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const navigate = useNavigate();

//   const queryParams = new URLSearchParams(location.search);
//   let workspaceName = queryParams.get("workspace_name");

//   if (!workspaceName) {
//     workspaceName = "VOCABC";
//   }

//   useEffect(() => {
//     // Get user's current location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLatitude(position.coords.latitude);
//           setLongitude(position.coords.longitude);
//         },
//         (error) => {
//           console.log("Error getting location:", error);
//           setStatusMessage(
//             "Failed to get location. Please ensure location services are enabled."
//           );
//           setIsSuccess(false);
//         }
//       );
//     } else {
//       console.log("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   const handleEmailChange = (e) => setEmail(e.target.value);
//   const handleUserIdChange = (e) => setUserId(e.target.value);
//   const handleOtpChange = (e) => setOtp(e.target.value);

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await sendOtpServices(email, userId);
//       if (response.data.success) {
//         setStatusMessage(response.data.message);
//         setIsSuccess(true);
//         setOtpSent(true);
//       } else {
//         setStatusMessage(
//           response.data.message || "Failed to send OTP. Please try again."
//         );
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to send OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleValidateOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await validateOtpServices(email, userId, otp);
//       if (response.data.success) {
//         setStatusMessage("OTP validated successfully.");
//         setIsSuccess(true);
//         setOtpValidated(true);
//       } else {
//         setStatusMessage(
//           response.data.message || "Failed to validate OTP. Please try again."
//         );
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.log(error);

//       setStatusMessage("Failed to validate OTP. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendEmail = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await emailServiceForUserDetails(
//         email,
//         userId,
//         latitude,
//         longitude,
//         workspaceName
//       );
//       if (response.data.success) {
//         setStatusMessage(response.data.message);
//         setIsSuccess(true);
//         const timeoutId = setTimeout(() => {
//           navigate("/voc");
//         }, 2000);

//         // Clear timeout if component unmounts
//         return () => clearTimeout(timeoutId);
//       } else {
//         setStatusMessage(response.data.message);
//         setIsSuccess(false);
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage = error.response?.data?.message;
//       setStatusMessage(errorMessage);
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleHome = () => navigate("/voc");

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-4">
//       <img src={Logo} className="w-48 h-auto mb-8" alt="VOC Logo" />
//       <form
//         className="w-full max-w-sm flex flex-col gap-4 items-center"
//         onSubmit={
//           otpValidated
//             ? handleSendEmail // If OTP is validated, send email
//             : otpSent
//             ? handleValidateOtp // If OTP is sent, validate OTP
//             : handleSendOtp // Initial state, send OTP
//         }
//       >
//         <input
//           type="text"
//           name="userId"
//           placeholder="Enter the code shown below your QR code in the sticker/product"
//           className="bg-white border border-gray-300 w-full p-2.5 text-sm font-poppins tracking-tight rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           required
//           value={userId}
//           onChange={handleUserIdChange}
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Enter your email"
//           className="bg-white border border-gray-300 w-full p-2.5 font-poppins tracking-tight text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           required
//           value={email}
//           onChange={handleEmailChange}
//         />

//         {otpSent && !otpValidated && (
//           <input
//             type="text"
//             name="otp"
//             placeholder="Enter the OTP"
//             className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
//             required
//             value={otp}
//             onChange={handleOtpChange}
//           />
//         )}

//         <button
//           type="submit"
//           className={`w-full py-3 text-sm font-semibold  px-2 font-poppins tracking-tight rounded-md transition-colors duration-300 ${
//             loading
//               ? "bg-blue-300 cursor-not-allowed text-gray-700"
//               : "bg-blue-600 hover:bg-blue-700 text-white"
//           }`}
//           disabled={loading}
//         >
//           {loading ? (
//             <div className="flex items-center justify-center gap-2">
//               <CircularProgress color="inherit" size={20} />
//               {otpValidated
//                 ? "Sending Email..."
//                 : otpSent
//                 ? "Verifying OTP..."
//                 : "Sending OTP..."}
//             </div>
//           ) : otpValidated ? (
//             "Submit then check your mail for credentials"
//           ) : otpSent ? (
//             "Verify OTP"
//           ) : (
//             "Send OTP"
//           )}
//         </button>

//         <div className="w-full flex gap-4">
//           <button
//             type="button"
//             className="w-full py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300"
//             onClick={handleHome}
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-[#27C65E] w-full text-white  py-2 rounded-lg transition-colors font-poppins tracking-tight font-semibold"
//             onClick={() =>
//               window.open("https://dowellresearch.sg/customer-login/", "_blank")
//             }
//           >
//             Help
//           </button>
//         </div>

//         {statusMessage && (
//           <p
//             className={`mt-2 text-center font-semibold ${
//               isSuccess ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {statusMessage}
//           </p>
//         )}

//         {/* {otpSent && (
//           <p className="mt-2 text-center font-poppins font-semibold tracking-tight text-gray-600">
//             Please check your email for the OTP. If you haven't received it, please check your spam folder.
//           </p>
//         )} */}
//       </form>
//     </div>
//   );
// };

// export default Registration;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/VOC.png";
import CircularProgress from "@mui/material/CircularProgress";
import {
  sendOtpServices,
  validateOtpServices,
  emailServiceForUserDetails,
} from "../../services/api.services";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(""); // New state for confirm email
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [otpValidated, setOtpValidated] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  let workspaceName = queryParams.get("workspace_name");

  if (!workspaceName) {
    workspaceName = "VOCABC";
  }

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log("Error getting location:", error);
          setStatusMessage(
            "Failed to get location. Please ensure location services are enabled."
          );
          setIsSuccess(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleConfirmEmailChange = (e) => setConfirmEmail(e.target.value); // New handler
  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sendOtpServices(email, userId);
      if (response.data.success) {
        setStatusMessage(response.data.message);
        setIsSuccess(true);
        setOtpSent(true);
      } else {
        setStatusMessage(
          response.data.message || "Failed to send OTP. Please try again."
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.log(error);

      setStatusMessage("Failed to send OTP. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await validateOtpServices(email, userId, otp);
      if (response.data.success) {
        setStatusMessage("OTP validated successfully.");
        setIsSuccess(true);
        setOtpValidated(true);
      } else {
        setStatusMessage(
          response.data.message || "Failed to validate OTP. Please try again."
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.log(error);

      setStatusMessage("Failed to validate OTP. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emailServiceForUserDetails(
        email,
        userId,
        latitude,
        longitude,
        workspaceName
      );
      if (response.data.success) {
        setStatusMessage(response.data.message);
        setIsSuccess(true);
        const timeoutId = setTimeout(() => {
          navigate("/voc");
        }, 2000);

        // Clear timeout if component unmounts
        return () => clearTimeout(timeoutId);
      } else {
        setStatusMessage(response.data.message);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message;
      setStatusMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => navigate("/voc");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <img src={Logo} className="w-48 h-auto mb-8" alt="VOC Logo" />
      <form
        className="w-full max-w-sm flex flex-col gap-4 items-center"
        onSubmit={
          otpValidated
            ? handleSendEmail // If OTP is validated, send email
            : otpSent
            ? handleValidateOtp // If OTP is sent, validate OTP
            : handleSendOtp // Initial state, send OTP
        }
      >
        <input
          type="text"
          name="userId"
          placeholder="Enter the code shown below your QR code in the sticker/product"
          className="bg-white border border-gray-300 w-full p-2.5 text-sm font-poppins tracking-tight rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
          value={userId}
          onChange={handleUserIdChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="bg-white border border-gray-300 w-full p-2.5 font-poppins tracking-tight text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="email"
          name="confirmEmail"
          placeholder="Confirm your email"
          className="bg-white border border-gray-300 w-full p-2.5 font-poppins tracking-tight text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
          value={confirmEmail}
          onChange={handleConfirmEmailChange}
          onPaste={(e) => e.preventDefault()}
        />

        {otpSent && !otpValidated && (
          <input
            type="text"
            name="otp"
            placeholder="Enter the OTP"
            className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
            value={otp}
            onChange={handleOtpChange}
          />
        )}

        <button
          type="submit"
          className={`w-full py-3 text-sm font-semibold px-2 font-poppins tracking-tight rounded-md transition-colors duration-300 ${
            loading ||
            email !== confirmEmail
              ? "bg-gray-400 cursor-not-allowed text-gray-700"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          disabled={loading || email !== confirmEmail}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <CircularProgress color="inherit" size={20} />
              {otpValidated
                ? "Sending Email..."
                : otpSent
                ? "Verifying OTP..."
                : "Sending OTP..."}
            </div>
          ) : otpValidated ? (
            "Submit then check your mail for credentials"
          ) : otpSent ? (
            "Verify OTP"
          ) : (
            "Send OTP"
          )}
        </button>

        <div className="w-full flex gap-4">
          <button
            type="button"
            className="w-full py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300"
            onClick={handleHome}
          >
            Cancel
          </button>
          <button
            className="bg-[#27C65E] w-full text-white  py-2 rounded-lg transition-colors font-poppins tracking-tight font-semibold"
            onClick={() =>
              window.open("https://dowellresearch.sg/customer-login/", "_blank")
            }
          >
            Help
          </button>
        </div>

        {statusMessage && (
          <p
            className={`mt-2 text-center font-semibold ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default Registration;
