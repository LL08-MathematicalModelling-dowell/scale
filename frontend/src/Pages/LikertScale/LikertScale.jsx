import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import npsScale from "../../assets/nps-scale.png";
import { saveLocationData, scaleResponse } from "../../services/api.services";
import voc from '../../assets/VOC.png';

const LikertScale = () => {
    const [submitted, setSubmitted] = useState(-1);
    const [loadingEmoji, setLoadingEmoji] = useState(null);
    const hasLocationDataBeenSaved = useRef(false); // Ref to track if location data is already saved

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const workspace_id = searchParams.get("workspace_id");
    const username = searchParams.get("username");
    const scale_id = searchParams.get("scale_id");
    const channel = searchParams.get("channel");
    const instance = searchParams.get("instance_name");
    const scaleType = searchParams.get("scale_type");
    console.log('scale type ', scaleType);

    const allParamsPresent = workspace_id && username && scale_id && channel && instance;

    useEffect(() => {
        if (!hasLocationDataBeenSaved.current && navigator.geolocation) {  // Check if the data has already been saved
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                const locationData = {
                    latitude,
                    longitude,
                    workspaceId: workspace_id,
                    event: "scanned",
                    scaleId: scale_id
                };

                try {
                    await saveLocationData(locationData);
                    hasLocationDataBeenSaved.current = true; // Mark as saved
                    console.log("locationData saved", locationData);
                } catch (error) {
                    console.error('Failed to save location data', error);
                }
            });
        }
    }, [workspace_id, scale_id]);

    const handleClick = async (index) => {
        console.log(index);

        setSubmitted(index);
        setLoadingEmoji(index);
        if (!allParamsPresent) {
            return;
        }

        try {
            const response = await scaleResponse(
                false,
                scaleType,
                channel,
                instance,
                workspace_id,
                username,
                scale_id,
                index
            );
            console.log('API Response:', response.data);
        } catch (error) {
            console.error('Failed to fetch scale response:', error);
        } finally {
            setLoadingEmoji(null); // Hide the loader after the request
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
            <div className="flex flex-col items-center p-4 bg-card rounded-lg max-w-full w-full md:max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold text-[#FD4704] mb-4 text-center">Are you satisfied with our service?</h2>
                <div className="flex items-center justify-center mb-4 space-x-2">
                    {['😠', '😐', '😶', '😊', '😁'].map((emoji, index) => (
                        <div className="relative" key={index}>
                            {loadingEmoji === index + 1 ? (
                                <CircularProgress
                                    size={24}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                />
                            ) : (
                                <span
                                    className={`text-${index === 0 ? 'red' : index === 1 ? 'orange' : index === 2 ? 'yellow' : index === 3 ? 'green' : 'green-700'}-500 text-2xl md:text-3xl cursor-pointer`}
                                    aria-label={index === 0 ? "Very Dissatisfied" : index === 1 ? "Dissatisfied" : index === 2 ? "Neutral" : index === 3 ? "Satisfied" : "Very Satisfied"}
                                    onClick={() => handleClick(index + 1)}
                                >
                                    {emoji}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center w-full justify-center">
                    <span className="text-xl md:text-2xl font-bold text-red-500">-</span>
                    <div className="flex w-8/12 md:w-9/12 h-2 mx-2 mt-1">
                        <div className="flex-1 bg-red-500 rounded-l-md"></div>
                        <div className="flex-1 bg-orange-500"></div>
                        <div className="flex-1 bg-yellow-500"></div>
                        <div className="flex-1 bg-green-500"></div>
                        <div className="flex-1 bg-green-700 rounded-r-md"></div>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-green-700">+</span>
                </div>

                <p className="text-muted-foreground text-center mb-8 text-sm md:text-base">Select your response</p>

                <p className="text-muted-foreground text-center mb-0 italic text-sm md:text-base font-medium">Your feedback is valuable to serve you better</p>
                <textarea
                    className="w-full p-2 border border-border border-gray-400 mb-4 h-20"
                    placeholder="Your Comments (Optional)"
                    aria-label="Your Comments"
                />
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 w-full">
                    <input
                        type="text"
                        className="w-full md:w-1/2 p-2 border border-border mb-2 md:mb-0 border-gray-400"
                        placeholder="Your Name (Optional)"
                        aria-label="Your Name"
                    />
                    <input
                        type="email"
                        className="w-full md:w-1/2 p-2 border border-border border-gray-400"
                        placeholder="Your Email (Optional)"
                        aria-label="Your Email"
                    />
                </div>
                <div className="flex justify-center space-x-4 w-full mb-4">
                    <button className="bg-[#9390a0] text-[#fff] py-1 px-4 rounded-full w-full md:w-auto">
                        Cancel
                    </button>
                    <button className="bg-[#03be68] text-[#fff] py-1 px-4 rounded-full w-full md:w-auto">
                        Submit
                    </button>
                </div>

                <div className="w-full my-2 flex items-center">
                    <hr className="border-t border-gray-300 flex-grow" />
                    <span className="px-4 text-sm text-muted-foreground text-[#5f5f5f]">Powered by</span>
                    <hr className="border-t border-gray-300 flex-grow" />
                </div>

                <div className="flex flex-row items-center justify-between w-full">
                    <img src={voc} className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
                    <footer className="text-center text-sm text-muted-foreground">
                        <strong className="text-[#5f5f5f] text-lg md:text-xl">DoWell Voice of Customers</strong>
                        <p className="text-[#8d6364] text-xs md:text-sm">Innovating from people’s minds</p>
                        <a href="mailto:dowell@dowellresearch.sg" className="text-[#5f5f5f] text-xs md:text-sm">dowell@dowellresearch.sg</a>
                    </footer>
                    <img src={voc} className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
                </div>
            </div>
        </div>
    );
};

export default LikertScale;
