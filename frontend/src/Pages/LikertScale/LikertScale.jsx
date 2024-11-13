import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material'; // Import Dialog components
import npsScale from "../../assets/nps-scale.png";
import { saveLocationData, scaleResponse, sendFeedbackEmail } from "../../services/api.services";
import voc from '../../assets/VOC.png';
import { sendEmail } from "../../services/emailServices";
import voc1 from '../../assets/likertScaleEmojis/VoC1.svg';
import voc2 from '../../assets/likertScaleEmojis/voc2.svg';
import voc3 from '../../assets/likertScaleEmojis/voc3.svg';
import voc4 from '../../assets/likertScaleEmojis/voc4.svg';
import voc5 from '../../assets/likertScaleEmojis/voc5.svg';
import helpMe from '../../assets/likertScaleEmojis/help me.svg';
import { QRCodeSVG } from 'qrcode.react';

const LikertScale = () => {
    const [submitted, setSubmitted] = useState(-1);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const hasLocationDataBeenSaved = useRef(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const workspace_id = searchParams.get("workspace_id");
    const username = searchParams.get("username");
    const scale_id = searchParams.get("scale_id");
    const channel = searchParams.get("channel");
    const instance = searchParams.get("instance_name");
    const scaleType = searchParams.get("scale_type");
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const allParamsPresent = workspace_id && username && scale_id && channel && instance;

    useEffect(() => {
        if (!hasLocationDataBeenSaved.current && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                setLongitude(longitude);
                setLatitude(latitude);

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
        }
    };

    const handleCancel = () => {
        setFeedback('');
        setName('');
        setEmail('');
    };

    const handleSubmit = async () => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

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
                
                const currentDate = new Date();

                const year = currentDate.getFullYear();
                const month = currentDate.toLocaleString('default', { month: 'long' });
                const day = currentDate.getDate().toString().padStart(2, '0');
                const hours = currentDate.getHours().toString().padStart(2, '0');
                const minutes = currentDate.getMinutes().toString().padStart(2, '0');

                const formattedDate = `${year}-${month} ${day} ${hours}:${minutes}`;

                const payload = {
                    workspaceId: workspace_id, 
                    customerName: name || "Anonymous User", 
                    customerEmail: email || "Anonymous Email", 
                    location:"", 
                    latitude, 
                    longitude,
                    scaleResponse: submitted,
                    description : feedback ,
                    type: getInstanceDisplayName(window.location.href),
                    formattedDate: formattedDate
                }
                
                await sendFeedbackEmail(payload)
                console.log("feedback sent successfully.");
                
                setOpenModal(true); 
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Unable to send the email. Please try again.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleClose = () => {
        setOpenModal(false);
        window.location.href = "https://dowellresearch.sg/"; 
    };

    const getInstanceDisplayName=(url)=> {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        const instanceDisplayName = params.get('instance_display_name');
        return decodeURIComponent(instanceDisplayName);
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
            <div className="flex flex-col items-center w-full max-w-full p-4 rounded-lg bg-card md:max-w-lg">
                <h2 className="text-xl md:text-3xl font-bold text-[#FD4704] mb-4 text-center">Are you satisfied with our service?</h2>
                <div className="flex items-center mt-4 space-x-2 justify-evenly sm:space-x-4">
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

                <div className="flex items-center justify-center w-full">
                    <span className="text-xl font-bold text-red-500 md:text-2xl">-</span>
                    <div className="flex items-center w-8/12 h-2 mx-2 mt-1 overflow-hidden rounded-full md:w-9/12">
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-red-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-orange-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-yellow-400"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-green-500"></div>
                        <div className="h-[100px] rotate-[325deg] flex-1 bg-green-700"></div>
                    </div>
                    <span className="text-xl font-bold text-green-700 md:text-2xl">+</span>
                </div>

                <p className="mt-0 mb-8 text-sm text-center text-muted-foreground md:text-base">
                    Select your response
                </p>

                <p className="mb-0 text-sm italic font-medium text-center text-muted-foreground md:text-base">Your feedback is valuable to serve you better</p>
                <textarea
                    className="w-full h-20 p-2 mb-2 border border-gray-400 border-border"
                    placeholder="Your Comments (Optional)"
                    aria-label="Your Comments"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex w-full">
                    <div className="sm:block hidden w-[70%] mr-12">
                        <div className="flex items-center w-full mx-2 justify-left">
                            <QRCodeSVG value={window.location.href} size={100} />
                            <p className="text-xs text-left w-[45%] p-2">Scan the QR code to open this page in your device</p>
                        </div>
                    </div>
                    <div className="w-[40%] flex flex-col md:items-center justify-center md:space-y-2 mb-2 w-full">
                        <input
                            type="text"
                            className="w-full p-2 mb-2 border border-gray-400 border-border"
                            placeholder="Your Name (Optional)"
                            aria-label="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-400 border-border"
                            placeholder="Your Email (Optional)"
                            aria-label="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="flex justify-center w-full mt-4 space-x-4">
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
                    </div>
                </div>

                <div className="flex items-center justify-between w-full mb-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="text-sm text-[#5f5f5f]">Powered by</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                <div className="flex flex-row items-center justify-between w-full">
                    <img src={voc} className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
                    <footer className="text-sm text-center text-muted-foreground">
                        <strong className="text-[#5f5f5f] text-lg md:text-xl">DoWell Voice of Customers</strong>
                        <p className="text-[#8d6364] text-xs md:text-sm">Innovating from people’s minds</p>
                        <a href="mailto:dowell@dowellresearch.sg" className="text-[#5f5f5f] text-xs md:text-sm">dowell@dowellresearch.sg</a>
                    </footer>
                    <a href="https://l.ead.me/meetuxlivinglab" target="blank">
                        <img src={helpMe} className="h-[60px] w-[60px] md:h-[80px] md:w-[80px] cursor-pointer" />
                    </a>
                </div>
                
                <p className="text-xs text-red-400">{getInstanceDisplayName(window.location.href)}</p>
            </div>

            <Dialog open={openModal} onClose={handleClose}>
                <DialogTitle>Thank You!</DialogTitle>
                <DialogContent>
                    <p>Thank you for your response.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LikertScale;