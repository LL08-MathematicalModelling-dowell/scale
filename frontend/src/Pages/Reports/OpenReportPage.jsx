import { useEffect, useState } from 'react';
import { workspaceNamesForLikert, workspaceNamesForNPS } from '@/data/Constants';
import NpsReport from './NpsOpenReportPage'; // Ensure you have this component
import LikertScaleReport from './LikertOpenReportPage'; // Ensure you have this component

const ReportPage = () => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const username = url.searchParams.get("username");
    const scaleId = url.searchParams.get("scale_id");
    const [scaleType, setScaleType] = useState("");

    useEffect(() => {
        if (workspaceNamesForNPS.includes(username)) {
            setScaleType("nps");
        } else if (workspaceNamesForLikert.includes(username)) {
            setScaleType("likert");
        } else {
            setScaleType("");
        }
    }, [username]);

    return (
        <>
            {scaleType === "nps" && <NpsReport />}
            {scaleType === "likert" && <LikertScaleReport scaleId={scaleId} />}
        </>
    );
};

export default ReportPage;
