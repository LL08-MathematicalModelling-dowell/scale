import { useLocation, useSearchParams } from "react-router-dom";
import { useCurrentUserContext } from "../contexts/CurrentUserContext";
import { useEffect } from "react";
import { getUserInfoFromClientAdmin, getUserInfoFromLogin, getApiKeyInfoFromClientAdmin } from "../services/loginServices";

const PRODUCT_LOGIN_URL = "https://100014.pythonanywhere.com/?redirect_url=" + window.location.origin
const USER_KEY_IN_SESSION_STORAGE = 'scale-user-detail';
const API_KEY_IN_SESSION_STORAGE = 'scale-api-key';

const getSavedLoggedInUser = () => {
    let userDetails;
    try {
        userDetails = JSON.parse(
            sessionStorage.getItem(USER_KEY_IN_SESSION_STORAGE)
        );
    } catch (error) {
        console.log("no saved user");
    }

    return userDetails;
};

export const getSavedApiKey = () => {
    let savedApiKey;

    savedApiKey = sessionStorage.getItem(API_KEY_IN_SESSION_STORAGE);

    return savedApiKey;
}

export default function useDowellLogin() {
    const {
        setCurrentUser,
        setCurrentUserDetailLoading,
        setCurrentUserApiKey
    } = useCurrentUserContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const { pathname } = useLocation()

    useEffect(() => {
        const session_id = searchParams.get("session_id");
        const id = searchParams.get("id");
        //const view = searchParams.get("view");
        const localUserDetails = getSavedLoggedInUser();
        const localAPIKey = getSavedApiKey();
        // const isSuccessScreen = view === 'success'
        const isVocRoute = (
            pathname === '/voc' || pathname === '/voc/' ||
            pathname === '/server-status' || pathname === '/server-status/' ||
            pathname === '/voc/reports' || pathname === '/voc/reports/' ||
            pathname === '/voc/report' || pathname === '/voc/report/' ||
            pathname === '/voc/scale' || pathname === '/voc/scale/' ||
            pathname === '/voc/scaledetails' || pathname === '/voc/scaledetails/' ||
            pathname === '/voc/userdetails' || pathname === '/voc/userdetails/' ||
            pathname === '/voc/register' || pathname === '/voc/register/' ||
            pathname === '/llx' || pathname === '/llx/' ||
            pathname === '/llx/reports' || pathname === '/llx/reports/' ||
            pathname === '/llx/report' || pathname === 'llx/report/' ||
            pathname === '/llx/scale' || pathname === '/llx/scale/' ||
            pathname === '/llx/scaledetails' || pathname === '/llx/scaledetails/' ||
            pathname === '/llx/userdetails' || pathname === '/llx/userdetails/' ||
            pathname === '/llx/register' || pathname === '/llx/register/' ||
            pathname === '/likert-report' || pathname === '/likert-report/' ||
            pathname === '/scale/map' || pathname === '/scale/map/'
        )

        if (localAPIKey) {
            setCurrentUserApiKey(localAPIKey);
        } else {
            getApiKeyInfoFromClientAdmin("6385c0f18eca0fb652c94558").then(res => {
                setCurrentUserApiKey(res?.data?.data?.api_key);
            }).catch(err => {
                console.log('err while fetching api key', err);
            })
        }

        if (localUserDetails) {
            console.log('in dowell login', localUserDetails)
            setCurrentUser(localUserDetails);
            return
        }

        if (session_id) {
            setCurrentUserDetailLoading(true);

            if (id) {
                getUserInfoFromClientAdmin(session_id)
                    .then(async (res) => {
                        try {
                            // const apiKeyRes = (await getApiKeyInfoFromClientAdmin(res.data?.userinfo?.client_admin_id)).data;
                            const apiKeyRes = (await getApiKeyInfoFromClientAdmin("6385c0f18eca0fb652c94558")).data;
                            setCurrentUserApiKey(apiKeyRes?.data?.api_key);

                            sessionStorage.setItem(
                                API_KEY_IN_SESSION_STORAGE, // define and store it in session also
                                apiKeyRes?.data?.api_key, // no stringifying because it's a string
                            );
                        } catch (error) {
                            console.log('err while fetching api key', error);
                        }

                        setCurrentUser(res.data);
                        setCurrentUserDetailLoading(false);

                        sessionStorage.setItem(
                            USER_KEY_IN_SESSION_STORAGE,
                            JSON.stringify(res.data)
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                        setCurrentUserDetailLoading(false);
                    });

                return;
            }

            getUserInfoFromLogin(session_id)
                .then(async (res) => {
                    try {
                        console.log('api key from client admin', res.data?.userinfo?.client_admin_id);
                        const apiKeyRes = (await getApiKeyInfoFromClientAdmin("6385c0f18eca0fb652c94558")).data;
                        setCurrentUserApiKey(apiKeyRes?.data?.api_key);

                        sessionStorage.setItem(
                            API_KEY_IN_SESSION_STORAGE, // define and store it in session also
                            apiKeyRes?.data?.api_key, // no stringifying because it's a string
                        );
                    } catch (error) {
                        console.log('err while fetching api key', error);
                    }

                    setCurrentUser(res.data);
                    setCurrentUserDetailLoading(false);

                    sessionStorage.setItem(
                        USER_KEY_IN_SESSION_STORAGE,
                        JSON.stringify(res.data)
                    );
                })
                .catch((err) => {
                    console.log(err);
                    setCurrentUserDetailLoading(false);
                });


            return
        }

        if (isVocRoute) return
        // redirecting to login
        sessionStorage.clear();
        window.location.replace(PRODUCT_LOGIN_URL + pathname);
    }, [])
}