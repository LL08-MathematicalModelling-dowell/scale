import {Route, Routes} from "react-router-dom";
import CreatingScale from "./Pages/CreateNewScale/CreatingScale";
import EditScale from "./Pages/EditScale/EditScale";
import HomePage from "./Pages/HomePage/HomePage";
import LikertReport from "./Pages/LikertReport/LikertReport";
import Login from "./Pages/Login/Login";
import Registration from "./Pages/Registration/RegistrationPage";
import OpenReportPage from "./Pages/Reports/OpenReportPage";
import Report from "./Pages/Reports/Report";
import ScaleDetails from "./Pages/Scale/ScaleDetails";
import Scales from "./Pages/Scale/Scales";
import ScalesReport from "./Pages/ScalesReport/ScalesReport";
import Healthcheck from "./Pages/SeverStatus/ServerHealthCheck";
import ShareScale from "./Pages/ShareScale/ShareScale";
import UserDetails from "./Pages/UserDetails/UserDetails";
import LLXLoginPage from "./Pages/llx/LLXLoginPage/LLXLoginPage";
import LLXOpenReportPage from "./Pages/llx/LLXOpenReportPage/LLXOpenReportPage";
import NewLLXReport from "./Pages/llx/LLXReport/NewLLXReport";
import LLXScale from "./Pages/llx/LLXScale/LLXScale";
import NewLLXScaleDetails from "./Pages/llx/LLXScaleDetails/NewLLXScaleDetails";
import LLXUserDetails from "./Pages/llx/LLXUserDetails/LLXUserDetails";
import Confirm from "./components/ScaleForm/Confirm";
import {ScaleDetailsProvider} from "./contexts/scaleDetailsContext";
import useDowellLogin from "./hooks/useDowellLogin";
import NewReport from "./Pages/Reports/NewReport";
import Preference from "./Pages/Preference/Preference";

const App = () => {
  useDowellLogin();
  return (
    <Routes>
      {/* Routes for llx */}
      {/* login page only change the logo [done]*/}
      <Route path="/llx" element={<LLXLoginPage />} />
      {/* 49 number line [done]*/}
      <Route
        path="/llx/reports"
        element={
          <ScaleDetailsProvider>
            <NewLLXReport />
          </ScaleDetailsProvider>
        }
      />
      {/* <Route path="/llx/newreport" element={<NewLLXReport/>} /> */}
      <Route path="/llx/scaledetails" element={
  <ScaleDetailsProvider>
    <NewLLXScaleDetails />
  </ScaleDetailsProvider>
} />
      
      <Route path="/llx/report" element={<LLXOpenReportPage />} />
      <Route path="/llx/scale" element={<LLXScale />} />
      <Route path="/llx/userdetails" element={<LLXUserDetails />} />
      <Route path="/llx/scaledetails" element={<NewLLXScaleDetails />} />
      <Route path="/llx/register" element={<Registration />} />
      {/* Routes for voc */}
      <Route path="/scale" element={<HomePage />} />
      <Route path="/server-status" element={<Healthcheck />} />
      <Route path="/voc" element={<Login />} />
      <Route path="/voc/reports" element={<Report />} />
      <Route path="/voc/report" element={<OpenReportPage />} />
      <Route path="/voc/likert-report" element={<LikertReport />} />
      <Route path="/voc/scale" element={<Scales />} />
      <Route path="/voc/scaledetails" element={<ScaleDetails />} />
      <Route path="/voc/userdetails" element={<UserDetails />} />
      <Route path="/voc/register" element={<Registration />} />
      <Route path="/voc/new" element={<NewReport />} />
      <Route path="/voc/preference" element={<Preference/>} />
      {/* Route for creating or edit scale */}
      <Route path="/edit-scale" element={<EditScale />} />
      <Route path="/scale-creating" element={<CreatingScale />} />
      <Route path="/confirmed" element={<Confirm />} />
      <Route path="/scale-reports" element={<ScalesReport />} />
      <Route path="/share-scale" element={<ShareScale />} />
    </Routes>
  );
};

export default App;
