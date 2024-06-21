

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import './css/index.css';
import QrCodeGenerator from './QrcodeGenerator';
import Home from './Home';
import ViewMedicine from './ViewMedicine';
import Login from './Login';
import Register from './Register';
import ViewWholesaler from './ViewWholesaler';
import WholesalerDashboard from './wholesaler/WholesalerDashboard';
import AllocateMedicine from './AllocateMedicine';
import BuyMedicinePage from './BuyMedicinePage';
import LoginSignup from './LoginSignup';
import AllocateDistributor from './wholesaler/AllocateDistributor';
import ViewDistributor from './wholesaler/ViewDistributor'; 
import DistributorDashboard from './Distributor/DistributorDashboard';
import ManageInventory from './Distributor/ManageInventory';
import QualityCheck from './Distributor/QualityCheck';
import ShipMedicineToHospital from './Distributor/ShipMedicineToHospital';
import HospitalDashboard from './hospital/HospitalDashboard';
import VerifyMedicine from './hospital/VerifyMedicine';
import SellMedicine from './hospital/SellMedicine';
import Buy from './patient/Buy';
import Track from './patient/Track';
import PatientDashboard from './patient/PatientDashboard';




function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/register" exact element={<Register />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/manufacturer" exact element={<QrCodeGenerator />} />
          <Route path="/viewmed" element={<ViewMedicine />} />
          <Route path="/viewwholesaler" element={<ViewWholesaler/>} />
          <Route path="/wholesaler" element={<WholesalerDashboard />} />
          <Route path="/allocatemedicine" element={<AllocateMedicine />} />
          <Route path='/buymedicine' exact element={<BuyMedicinePage />} />
          <Route path='/lg' exact element={<LoginSignup />} />
          <Route path='/allocatedistributor' exact element={<AllocateDistributor />} />
          <Route path='/viewdistributor' exact element={<ViewDistributor />} />
         <Route path= '/distributor' exact element={<DistributorDashboard />} />
         <Route path= '/manageinventory' exact element={<ManageInventory />} />
         <Route path= '/qualitycheck' exact element={<QualityCheck />} />
         <Route path= '/shipmedicine' exact element={<ShipMedicineToHospital />} />
         <Route path= '/hospital' exact element={<HospitalDashboard />} />
         <Route path='/verifymed' exact element={<VerifyMedicine />} />
         <Route path = '/sellmedicine' exact element={<SellMedicine />} />
         <Route path = '/buy' exact element={<Buy />} />
         <Route path = '/track' exact element={<Track />} />
         <Route path ='/patient' exact element={<PatientDashboard />} />


          
        </Routes>
      </Router>
      
     
    </div>
  );
}

export default App;
