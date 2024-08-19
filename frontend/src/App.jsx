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

const App = () => {
  useDowellLogin();
  return (
    <Routes>
      <Route path="/scale" element={<HomePage />} />
      <Route path="/server-status" element={<Healthcheck />} />
      <Route path="/voc" element={<Login />} />
      <Route path="/voc/reports" element={<Report />} />
      <Route path="/voc/report" element={<OpenReportPage />} />
      <Route path="/voc/scale" element={<Scales />} />
      <Route path="/voc/scaledetails" element={<ScaleDetails />} />
      <Route path="/voc/userdetails" element={<UserDetails />} />
    </Routes>
  );
};

export default App;
