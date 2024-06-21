import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import 'bootstrap/dist/css/bootstrap.min.css';


const WholesalerDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [wholesalerAddress, setWholesalerAddress] = useState('');
  const [allocatedMedicines, setAllocatedMedicines] = useState([]);

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
          setWholesalerAddress(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (contractInstance && wholesalerAddress) {
      loadAllocatedMedicines();
    }
  }, [contractInstance, wholesalerAddress]);

  const loadAllocatedMedicines = async () => {
    try {
      const result = await contractInstance.methods.getAllocatedMedicineByAddress(wholesalerAddress).call();
      console.log('Allocated Medicines:', result);

      setAllocatedMedicines(result);
    } catch (error) {
      console.error('Error loading allocated medicines:', error);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '20px' }}>
  <div style={{ boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
    <nav style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Pharma Supply Chain</h1>
        <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', marginLeft: 'auto' }}>
          <li style={{ marginRight: '10px' }}>
            <a href="/allocatedistributor" style={{ color: '#fff', textDecoration: 'none' }}>Allocate To Distributor</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="/viewdistributor" style={{ color: '#fff', textDecoration: 'none' }}>View Distributor</a>
          </li>
          <li>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Logout</a>
          </li>
        </ul>
      </div>
    </nav>
    <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Wholesaler Dashboard</h1>
    <div style={{ marginBottom: '20px' }}>
      {/* <h3 style={{ marginBottom: '10px' }}>Allocated Medicines</h3> */}
      {Object.keys(allocatedMedicines).length > 0 ? (
        <div>
          {allocatedMedicines['ids'].map((id, index) => (
            <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
              <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>{allocatedMedicines['names'][index]}</h2>
              <p><strong>Description:</strong> {allocatedMedicines['descriptions'][index]}</p>
              <p><strong>Manufacturer Date:</strong> {allocatedMedicines['manufacturerDates'][index]}</p>
              <p><strong>Expiry Date:</strong> {allocatedMedicines['expiryDates'][index]}</p>
              <p><strong>Price:</strong> {allocatedMedicines['prices'][index]}</p>
              <p><strong>IPFS Hash:</strong> {allocatedMedicines['ipfsHashes'][index]}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No allocated medicines found.</p>
      )}
    </div>
  </div>
</div>
  )};

export default WholesalerDashboard;
