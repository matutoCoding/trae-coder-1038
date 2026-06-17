import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ElevatorList from "@/pages/ElevatorList";
import ElevatorDetail from "@/pages/ElevatorDetail";
import ContractList from "@/pages/ContractList";
import ElevatorDisable from "@/pages/ElevatorDisable";
import DispatchList from "@/pages/DispatchList";
import DispatchDetail from "@/pages/DispatchDetail";
import CertificateList from "@/pages/CertificateList";
import CheckinScan from "@/pages/CheckinScan";
import CheckinItems from "@/pages/CheckinItems";
import CheckinParts from "@/pages/CheckinParts";
import RepairList from "@/pages/RepairList";
import RepairNew from "@/pages/RepairNew";
import RepairDetail from "@/pages/RepairDetail";
import RescueList from "@/pages/RescueList";
import RescueDetail from "@/pages/RescueDetail";
import RescueRecord from "@/pages/RescueRecord";
import InspectionList from "@/pages/InspectionList";
import InspectionNew from "@/pages/InspectionNew";
import Stats from "@/pages/Stats";
import StatsDetail from "@/pages/StatsDetail";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/elevators" element={<ElevatorList />} />
          <Route path="/elevators/:id" element={<ElevatorDetail />} />
          <Route path="/elevators/:id/disable" element={<ElevatorDisable />} />
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/dispatch" element={<DispatchList />} />
          <Route path="/dispatch/:id" element={<DispatchDetail />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/checkin" element={<CheckinScan />} />
          <Route path="/checkin/:id/items" element={<CheckinItems />} />
          <Route path="/checkin/:id/parts" element={<CheckinParts />} />
          <Route path="/repair" element={<RepairList />} />
          <Route path="/repair/new" element={<RepairNew />} />
          <Route path="/repair/:id" element={<RepairDetail />} />
          <Route path="/rescue" element={<RescueList />} />
          <Route path="/rescue/:id" element={<RescueDetail />} />
          <Route path="/rescue/:id/record" element={<RescueRecord />} />
          <Route path="/inspection" element={<InspectionList />} />
          <Route path="/inspection/new" element={<InspectionNew />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/stats/:workerId" element={<StatsDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
}
