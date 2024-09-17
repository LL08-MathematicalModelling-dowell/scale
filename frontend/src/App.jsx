import { Route, Routes } from "react-router-dom";
import Healthcheck from "./Pages/SeverStatus/ServerHealthCheck";
import Report from "./Pages/Reports/Report";
import Login from "./Pages/Login/Login";
import UserDetails from "./Pages/UserDetails/UserDetails";
import ScaleDetails from "./Pages/Scale/ScaleDetails";
import Scales from "./Pages/Scale/Scales";
import OpenReportPage from "./Pages/Reports/OpenReportPage";
import useDowellLogin from "./hooks/useDowellLogin";
import HomePage from "./Pages/HomePage/HomePage";
import Registration from './Pages/Registration/RegistrationPage';
import LikertReport from "./Pages/LikertReport/LikertReport";
import EditScale from "./Pages/EditScale/EditScale";
import CreatingScale from "./Pages/CreateNewScale/CreatingScale";
import Confirm from "./components/ScaleForm/Confirm";
import ScalesReport from "./Pages/ScalesReport/ScalesReport";
import ShareScale from "./Pages/ShareScale/ShareScale";

const App = () => {
  useDowellLogin();
  return (
    <Routes>
      <Route path="/scale" element={<HomePage />} />
      <Route path="/server-status" element={<Healthcheck />} />
      <Route path="/voc" element={<Login />} />
      <Route path="/voc/reports" element={<Report />} />
      <Route path="/voc/report" element={<OpenReportPage />} />
      <Route path="/voc/likert-report" element={<LikertReport/>} />
      <Route path="/voc/scale" element={<Scales />} />
      <Route path="/voc/scaledetails" element={<ScaleDetails />} />
      <Route path="/voc/userdetails" element={<UserDetails />} />
      <Route path="/voc/register" element={<Registration />} />
      {/* Route for creating or edit scale */}
      <Route path='/edit-scale' element={<EditScale/>} />
      <Route path="/scale-creating" element={<CreatingScale/>}/>
      <Route path="/confirmed" element={<Confirm/>}/>
      <Route path="/scale-reports" element={<ScalesReport/>} />
      <Route path="/share-scale" element={<ShareScale />}/>
    </Routes>
  );
};

export default App;
