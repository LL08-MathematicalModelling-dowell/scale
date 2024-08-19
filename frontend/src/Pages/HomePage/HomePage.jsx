import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { useEffect, useState } from "react";

const HomePage = () => {
    const { currentUser, currentUserDetailLoading } = useCurrentUserContext();
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!currentUserDetailLoading) {
            const portfolioInfo = currentUser?.portfolio_info || [];
            const hasPortfolioInfo = portfolioInfo.length > 0;

            if (!hasPortfolioInfo) {
                setMessage('Please create an account to proceed.');
            } else {
                const hasLivingLabProduct = portfolioInfo.some(info => info.product === 'Living Lab Scales');
                if (!hasLivingLabProduct) {
                    setMessage('Please create a portfolio with the "Living Lab Scales" product.');
                } else {
                    setMessage('Scale Home Page');
                }
            }
        }
    }, [currentUser, currentUserDetailLoading]);

    return (
        <div>
            {currentUserDetailLoading ? (
                'Loading...'
            ) : (
                message
            )}
        </div>
    );
};

export default HomePage;
