import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Link } from 'react-router-dom';
import SupplyChain from '../artifacts/SupplyChain.json';
import { create } from 'ipfs-http-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageInventory = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [medicineId, setMedicineId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    connectToBlockchain();
  }, []);

  const handleManageInventory = async () => {
    try {
      // Validate input fields
      if (!medicineId || !quantity) {
        throw new Error('Please enter Medicine ID and Quantity');
      }

      // Generate IPFS hash
      const textData = `Medicine ID: ${medicineId}, Quantity: ${quantity}`;
      const hash = await addTextToIPFS(textData);
      console.log('Generated IPFS hash:', hash);
      setIpfsHash(hash);

      // Check if web3 and contractInstance are initialized
      if (!web3 || !contractInstance) {
        throw new Error('Web3 or contract instance not initialized');
      }

      // Get the default account
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      // Send the transaction with the "from" address
      const result = await contractInstance.methods
        .manageInventory(medicineId, quantity, hash)
        .send({ from: fromAddress });

      setMessage(`Inventory managed successfully for medicine ID ${medicineId}`);
    } catch (error) {
      console.error('Error managing inventory:', error);
      setError(error); // Log the error to state
      setMessage(`Error managing inventory: ${error.message}`);
    }
  };

  const connectToBlockchain = async () => {
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
      } catch (error) {
        console.error('Error connecting to blockchain:', error);
        setMessage(`Error connecting to blockchain: ${error.message}`);
      }
    }
  };

  const addTextToIPFS = async (textData) => {
    try {
      const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });
      const bufferData = Buffer.from(textData);
      const response = await ipfs.add(bufferData);

      console.log('IPFS add response:', response);

      // Check the response length and path property
      if (response && response.path) {
        const ipfsPath = response.path;
        return ipfsPath;
      } else {
        throw new Error('Invalid response from IPFS');
      }
    } catch (error) {
      console.error('Error adding text to IPFS:', error);
      throw error;
    }
  };

  // Function to fetch medicine name based on ID
  const fetchMedicineName = async () => {
    try {
      // Check if web3 and contractInstance are initialized
      if (!web3 || !contractInstance) {
        throw new Error('Web3 or contract instance not initialized');
      }

      // Call the contract method to get the name
      const result = await contractInstance.methods.getMedicineById(medicineId).call();
      setMedicineName(result.name);
    } catch (error) {
      console.error('Error fetching medicine name:', error);
    }
  };

  // Call fetchMedicineName whenever the medicineId changes
  useEffect(() => {
    if (medicineId) {
      fetchMedicineName();
    }
  }, [medicineId]);

  return (
    <div className="container mt-5">
      <h1>Manage Inventory</h1>
      <div className="mb-3">
        <label htmlFor="medicineId" className="form-label">Medicine ID</label>
        <input type="text" className="form-control" id="medicineId" value={medicineId} onChange={(e) => setMedicineId(e.target.value)} />
      </div>
      <div className="mb-3">
        <label htmlFor="medicineName" className="form-label">Medicine Name</label>
        <input type="text" className="form-control" id="medicineName" value={medicineName} disabled />
      </div>
      <div className="mb-3">
        <label htmlFor="quantity" className="form-label">Quantity</label>
        <input type="text" className="form-control" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">IPFS Hash</label>
        <p>{ipfsHash}</p>
      </div>
      <button className="btn btn-primary mb-3" onClick={handleManageInventory}>Manage Inventory</button>
      {message && <div className="alert alert-info">{message}</div>}
    </div>
  );
};

export default ManageInventory;
