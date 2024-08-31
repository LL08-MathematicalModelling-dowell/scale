import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import npsScale from "../../assets/nps-scale.png";
import { saveLocationData, scaleResponse } from "../../services/api.services";
import voc from '../../assets/VOC.png';
import { sendEmail } from "../../services/emailServices";
import voc1 from '../../assets/likertScaleEmojis/VoC1.svg';
import voc2 from '../../assets/likertScaleEmojis/voc2.svg';
import voc3 from '../../assets/likertScaleEmojis/voc3.svg';
import voc4 from '../../assets/likertScaleEmojis/voc4.svg';
import voc5 from '../../assets/likertScaleEmojis/voc5.svg';
import helpMe from '../../assets/likertScaleEmojis/help me.svg';

const LikertScale = () => {
    const [submitted, setSubmitted] = useState(-1);
    // const [loadingEmoji, setLoadingEmoji] = useState(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const hasLocationDataBeenSaved = useRef(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const workspace_id = searchParams.get("workspace_id");
    const username = searchParams.get("username");
    const scale_id = searchParams.get("scale_id");
    const channel = searchParams.get("channel");
    const instance = searchParams.get("instance_name");
    const scaleType = searchParams.get("scale_type");

    const allParamsPresent = workspace_id && username && scale_id && channel && instance;

    useEffect(() => {
        if (!hasLocationDataBeenSaved.current && navigator.geolocation) {
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
                    hasLocationDataBeenSaved.current = true;
                    console.log("locationData saved", locationData);
                } catch (error) {
                    console.error('Failed to save location data', error);
                }
            });
        }
    }, [workspace_id, scale_id]);

    const handleClick = async (index) => {
        // setLoadingEmoji(index);
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
                submitted
            );
            console.log('API Response:', response.data);
        } catch (error) {
            console.error('Failed to fetch scale response:', error);
            alert("Unable to submit your response. Please try again.");
        } finally {
            // setLoadingEmoji(null);
        }
    };

    const handleCancel = () => {
        setFeedback('');
        setName('');
        setEmail('');
    };


    const handleSubmit = async () => {
        // Validate email only if it's provided
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
    
        // If email is valid or not provided, proceed with submission
        setLoadingSubmit(true);
        try {
            if (submitted !== -1) {
                await sendEmail({
                    message: feedback,
                    email,
                    scale_name: scaleType,
                    score: submitted,
                    channel,
                    instance,
                    username: name || username,
                });
                console.log("Email sent successfully.");
                alert("Thank you for your response.");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Unable to send the email. Please try again.");
        } finally {
            setLoadingSubmit(false);
        }
    };    

    return (
        <div className="flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
            <div className="flex flex-col items-center p-4 bg-card rounded-lg max-w-full w-full md:max-w-md">
                <h2 className="text-xl md:text-3xl font-bold text-[#FD4704] mb-4 text-center">Are you satisfied with our service?</h2>
                <div className="flex items-center justify-evenly space-x-2 sm:space-x-4">
                    {[voc1, voc2, voc3, voc4, voc5].map((emoji, index) => (
                        <div className="relative" key={index}>
                            <img
                                src={emoji}
                                onClick={() => setSubmitted(index + 1)}
                                className={`cursor-pointer 
                                        ${submitted === index + 1 ?
                                        `border-2 ${submitted == 1 ? 'border-red-500' :
                                            (submitted == 2 ? 'border-orange-500' : (
                                                submitted == 3 ? 'border-yellow-400' : (
                                                    submitted == 4 ? 'border-[#acd91a]' :
                                                        'border-green-700')))} rounded` :
                                        ''}`}
                                alt={`emoji-${index + 1}`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center w-full justify-center">
                    <span className="text-xl md:text-2xl font-bold text-red-500">-</span>
                    <div className="flex items-center w-8/12 md:w-9/12 h-2 mx-2 mt-1 overflow-hidden rounded-full">
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-red-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-orange-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-yellow-400"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-green-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-green-700"></div>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-green-700">+</span>
                </div>

                <p className="text-muted-foreground text-center mt-0 mb-4 text-sm md:text-base">
                    Select your response
                </p>

                <p className="text-muted-foreground text-center mb-0 italic text-sm md:text-base font-medium">Your feedback is valuable to serve you better</p>
                <textarea
                    className="w-full p-2 border border-border border-gray-400 mb-4 h-20"
                    placeholder="Your Comments (Optional)"
                    aria-label="Your Comments"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 w-full">
                    <input
                        type="text"
                        className="w-full md:w-1/2 p-2 border border-border mb-2 md:mb-0 border-gray-400"
                        placeholder="Your Name (Optional)"
                        aria-label="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="email"
                        className="w-full md:w-1/2 p-2 border border-border border-gray-400"
                        placeholder="Your Email (Optional)"
                        aria-label="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex justify-center space-x-4 w-full mb-4">
                    <button
                        className="bg-[#9390a0] text-[#fff] py-1 px-4 rounded-full w-full md:w-auto"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-[#03be68] text-[#fff] py-1 px-4 rounded-full w-full md:w-auto"
                        onClick={() => {
                            handleSubmit();
                            handleClick();
                        }}
                        disabled={loadingSubmit}
                    >
                        {loadingSubmit ? <CircularProgress size={24} /> : 'Submit'}
                    </button>
                </div>

                <div className="w-full mt-2 flex items-center">
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
                    <img src={helpMe} className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
                </div>
            </div>
        </div>
    );
};

export default LikertScale;
