import {useState} from "react";
import adminLogo from "../../assets/adminLogo.png";
import {UserScaleData} from "../../data/DummyData";
import { IoSettings  } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";



const CustomHeader = () => {
  const [profileToggle, setProfileToggle] = useState(false);

  const handleOpenProfile= () => {
    setProfileToggle(!profileToggle);
  };

  const menuLinks = [
    {
        name: "Settings",
        path: "/settings",
        icon: <IoSettings/>,
    },
    {
        name: "Client admin",
        path: "/client-admin",
        icon: <FaCircleUser/>,
    },
    {
        name: "Log Out",
        path: "/logout",
        icon : <RiLogoutCircleRLine/>
    }
  ];
  return (
    <div className="flex items-center justify-between px-2 md:px-8 py-4 border-gray-200 border-b-[1px] bg-white">
      <div className="flex items-center justify-center">
        <img
          src={adminLogo}
          alt="Dowell Scale adminLogo"
          className="w-20"
        />
        <h2 className="hidden  md:block font-poppins font-bold text-2xl text-dowellDeepGreen tracking-tight">Dowell Scales</h2>
      </div>
      <div className="relative">
        <img
          src={UserScaleData.profileImage}
          alt="Profile-Image"
          className="rounded-full w-12 h-12  md:w-14 md:h-14 object-cover cursor-pointer shadow-lg"
          onClick={handleOpenProfile}
        />
        {profileToggle && (
            <div className="fixed right-8">
            <div className=" bg-white shadow-lg p-4  rounded-xl">
           <div className="flex flex-col gap-3 ">
       {menuLinks.map((link, index) => (
        <div className="flex items-center gap-2 hover:text-dowellDeepGreen transition ease-in-out hover:scale-105 " key={index}>
          {link.icon}
        <Link className="font-poppins font-medium tracking-tight text-[14px] ">{link.name}</Link>
        </div>
       ))}
           </div>
            </div>
          <div className="flex justify-end pt-1 pr-3">  <IoCloseCircle className="size-5 text-red-500 cursor-pointer" onClick={handleOpenProfile} /></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CustomHeader;
