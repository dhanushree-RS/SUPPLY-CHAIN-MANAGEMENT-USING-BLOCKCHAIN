import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from '../artifacts/SupplyChain.json';
import QRCode from 'qrcode.react';

const Buy = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [hospitalMedicines, setHospitalMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [message, setMessage] = useState('');
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [qrData, setQRData] = useState('');

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = SupplyChainContract.networks[networkId];
          const supplyChainContract = new web3Instance.eth.Contract(
            SupplyChainContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(supplyChainContract);
        } catch (error) {
          console.error('Error connecting to Web3:', error);
        }
      } else {
        console.error('Web3 not found. Please install MetaMask.');
      }
    };
    loadWeb3();
  }, []);

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const count = await contract.methods.medicineCount().call();
        const medicineList = [];
        const hospitalMedicineList = [];
        for (let i = 1; i <= count; i++) {
          const medicine = await contract.methods.getMedicineById(i).call();
          medicineList.push(medicine);
          if (medicine.currentStatus === 'verified and Delivered') {
            hospitalMedicineList.push(medicine);
          }
        }
        setMedicines(medicineList);
        setHospitalMedicines(hospitalMedicineList);
      } catch (error) {
        console.error('Error loading medicines:', error);
      }
    };
    if (contract) {
      loadMedicines();
    }
  }, [contract]);

  const handleBuyMedicine = async () => {
    if (!selectedMedicine) {
      setMessage('Please select a medicine');
      return;
    }
    try {
      await contract.methods.buyMedicine(selectedMedicine.id).send({ from: account, value: web3.utils.toWei('5', 'ether') });
      setMessage('Medicine bought successfully! QR code link has been generated.');
      generateQRCode(selectedMedicine); // Call function to generate QR code
    } catch (error) {
      setMessage('Error buying medicine: ' + error.message);
    }
  };

  const generateQRCode = (medicine) => {
    const qrData = JSON.stringify(medicine); // Convert medicine object to JSON string
    setQRData(qrData);
  };
  

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">Pharma SupplyChain</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/patient">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Buy">Buy Medicine</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/track">Track Medicine</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <h2 className="mb-4" style={{textAlign:'center'}}>BUY MEDICINE</h2>
      <div className="container" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginTop: '20px' }}>
        <div className="row">
          {hospitalMedicines.map((medicine) => (
            <div key={medicine.id} className="col-lg-11 col-md-4 col-sm-15 mb-4">
              <div className="card h-100" style={{ boxShadow: '0 5px 5px 0 rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
                <div className="card-body">
                  <h5 className="card-title">{medicine.name}</h5>
                  <p className="card-text">ID: {medicine.id}</p>
                  <p className="card-text">Composition: {medicine.composition}</p>
                  <p className="card-text">Description: {medicine.description}</p>
                  <p className="card-text">Price: {medicine.price}</p>
                  <button className="btn btn-primary mr-2" onClick={() => { setSelectedMedicine(medicine); setShowBuyButton(true); }}>Select</button>
                  {showBuyButton && selectedMedicine === medicine && (
                    <button className="btn btn-success" onClick={handleBuyMedicine}>Buy Medicine</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {qrData && (
        <div className="container mt-4">
          <h2>QR Code</h2>
          <div className="row">
            <div className="col-md-6 offset-md-3 text-center">
              <QRCode value={qrData} />
              <p><a href={`data:image/png;base64,${btoa(qrData)}`} download="qrcode.png">Download QR Code</a></p>
            </div>
          </div>
        </div>
      )}

      {message && <div className="container mt-4"><div className="alert alert-info">{message}</div></div>}
    </div>
  );
};

export default Buy;
