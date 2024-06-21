import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import 'bootstrap/dist/css/bootstrap.min.css';
//import './css/viewmed.css';


const PatientDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');

  // Initialize Web3 and contract instance
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

          // Fetch and display all medicines
          fetchAllMedicines(contract);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  // Function to fetch all medicines from the smart contract
  const fetchAllMedicines = async (contract) => {
    try {
      const totalMedicines = await contract.methods.medicineCount().call();
      const purchasedMedicinesArray = [];
      for (let i = 1; i <= totalMedicines; i++) {
        const medicine = await contract.methods.medicines(i).call();
        if (medicine.currentStatus === "Purchased" || medicine.currentStatus === "verified and Delivered") {
          purchasedMedicinesArray.push(medicine);
        }
      }
      console.log(purchasedMedicinesArray);
      setMedicines(purchasedMedicinesArray);
      setError('');
    } catch (error) {
      console.error('Error fetching purchased medicines:', error);
      setError('Error fetching purchased medicines. Please try again.');
    }
  };
  

  // Function to render medicine details in table format
  const renderMedicineDetails = () => {
    if (medicines.length === 0) {
      return <p>No medicines available.</p>;
    }

    return (
      <div>
        
        <table className="table-wrapper">
          <thead>
            <tr>
              <th>ID</th>
              {/* <th>Prefix</th> */}
              <th>Name</th>
              <th>composition</th>
              <th>Description</th>
              <th>Manufacturer Date</th>
              <th>Expiry Date</th>
              <th>Price</th>
              {/* <th>IPFS Hash</th>
              <th>Wholesaler</th> */}
              
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine, index) => (
              <tr key={index}>
                <td>{medicine.id}</td>
                {/* <td>{medicine.prefix}</td> */}
                <td>{medicine.name}</td>
                <td>{medicine.composition}</td>
                <td>{medicine.description}</td>
                <td>{medicine.manufacturerDate}</td>
                <td>{medicine.expiryDate}</td>
                <td>{medicine.price}</td>
                {/* <td>{medicine.ipfsHash}</td> */}
                {/* <td>{medicine.ipfsHash}</td> */}
                {/* <td>{medicine.wholesaler}</td> */}
                <td>{medicine.currentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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

        <h3 style={{textAlign:'center', paddingTop:'20px'}}>PatientDashboard</h3>
  
        <div className="container mt-5">
          {error && <div className="text-danger">{error}</div>}
          {renderMedicineDetails()}
        </div>
      </div>
  
  );
}

export default PatientDashboard;
