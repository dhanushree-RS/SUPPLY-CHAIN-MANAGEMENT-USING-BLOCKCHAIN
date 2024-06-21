import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';

const HospitalDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [allocatedMedicines, setAllocatedMedicines] = useState({});

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = SupplyChain.networks[networkId];
          const contract = new web3Instance.eth.Contract(
            SupplyChain.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContractInstance(contract);

          const accounts = await web3Instance.eth.getAccounts();
          setConnectedAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (contractInstance && connectedAccount) {
      loadAllocatedMedicines();
    }
  }, [contractInstance, connectedAccount]);

  const loadAllocatedMedicines = async () => {
    try {
      const result = await contractInstance.methods.getAllocatedMedicineByAddress(connectedAccount).call();
      console.log('Allocated Medicines:', result);
      setAllocatedMedicines(result || {});
    } catch (error) {
      console.error('Error loading allocated medicines:', error);
    }
  };

  return (
    <div style={{ marginTop: '50px', padding: '0 20px' }}>
      <nav style={{ backgroundColor: '#343a40', color: '#fff', padding: '10px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Hospital Dashboard</h1>
          <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', marginLeft: 'auto' }}>
            <li style={{ marginRight: '10px' }}>
              <Link to="/verifymed" style={{ color: '#fff', textDecoration: 'none' }}>Verify Medicine</Link>
            </li>
            <li>
              <Link to="/sellMedicine" style={{ color: '#fff', textDecoration: 'none' }}>Sell To Patients</Link>
            </li>
          </ul>
          <Link to="/logout" style={{ color: '#fff', textDecoration: 'none', border: '1px solid #fff', borderRadius: '5px', padding: '5px 10px', marginLeft: '20px' }}>Logout</Link>
        </div>
      </nav>

     

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {Object.keys(allocatedMedicines).length === 0 && <p>No allocated medicines found.</p>}
        {allocatedMedicines.ids && allocatedMedicines.ids.map((id, index) => (
          <div key={id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', width: '300px' }}>
            <div>ID: {id}</div>
            <div>Prefix: {allocatedMedicines.prefixes[index]}</div>
            <div>Name: {allocatedMedicines.names[index]}</div>
            <div>Description: {allocatedMedicines.descriptions[index]}</div>
            <div>Manufacturer Date: {allocatedMedicines.manufacturerDates[index]}</div>
            <div>Expiry Date: {allocatedMedicines.expiryDates[index]}</div>
            <div>Price: {allocatedMedicines.prices[index]}</div>
            <div>Composition: {allocatedMedicines.compositions[index]}</div>
            <div>Status: {allocatedMedicines.statuses[index]}</div>
            {/* <div>
              <QRCode value={allocatedMedicines.ipfsHashes[index]} size={128} />
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalDashboard;
