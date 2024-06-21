import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from '../artifacts/SupplyChain.json'; // Import your contract ABI
import { Link } from 'react-router-dom';
import { create } from 'ipfs-http-client'; // Import ipfs-http-client

const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' }); // Initialize IPFS client

function VerifyMedicine() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [medicineId, setMedicineId] = useState('');
  const [manufacturerFile, setManufacturerFile] = useState(null);
  const [wholesalerFile, setWholesalerFile] = useState(null);
  const [distributorFile, setDistributorFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadBlockchainData().then(() => setLoading(false)).catch(error => {
      console.error('Error loading blockchain data: ', error);
      setLoading(false);
    });
  }, []);

  const loadBlockchainData = async () => {
    try {
      // Connect to Web3 provider
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }

      // Get current Ethereum accounts
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Load the smart contract
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setContract(contractInstance);
    } catch (error) {
      console.error('Error loading blockchain data: ', error);
    }
  };

  const uploadToIPFS = async (file) => {
    try {
      const fileBuffer = await file.arrayBuffer();
      const ipfsResult = await ipfs.add(fileBuffer);
      return ipfsResult.path;
    } catch (error) {
      console.error('Error uploading to IPFS: ', error);
      return null;
    }
  };

  const fetchMedicineDetails = async () => {
    try {
      if (!contract || !medicineId) {
        setMedicineDetails(null); // Reset medicine details if no ID is provided
        return;
      }

      // Call the smart contract method to get medicine details
      const details = await contract.methods.getMedicineById(medicineId).call();
      setMedicineDetails(details);
    } catch (error) {
      console.error('Error fetching medicine details: ', error);
    }
  };

  useEffect(() => {
    fetchMedicineDetails();
  }, [contract, medicineId]);

  const verifyIPFSHashes = async () => {
    try {
      setStatusMessage('Verifying IPFS hashes...');
      if (!contract) {
        setStatusMessage('Contract not loaded');
        return;
      }

      // Upload files to IPFS and get hashes
      const manufacturerHash = await uploadToIPFS(manufacturerFile);
      const wholesalerHash = await uploadToIPFS(wholesalerFile);
      const distributorHash = await uploadToIPFS(distributorFile);

      // Call the smart contract method to verify IPFS hashes
      await contract.methods.verifyIPFSHashes(medicineId, manufacturerHash, wholesalerHash, distributorHash).send({ from: account });

      // Call the smart contract method to get updated medicine details
      const details = await contract.methods.getMedicineById(medicineId).call();
      setMedicineDetails(details);

      // Get current date
      const currentDate = new Date();
      const expiryDate = new Date(details.expiryDate);

      if (currentDate > expiryDate) {
        setStatusMessage('Medicine has expired!');
      } else {
        setStatusMessage('IPFS hashes verified successfully!');
      }
    } catch (error) {
      console.error('Error verifying IPFS hashes: ', error);
      setStatusMessage('Failed to verify IPFS hashes');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <nav style={{ backgroundColor: '#282c34', color: 'white', width: '100%', padding: '10px 0', marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>Medicine Verification</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <Link to="/hospital" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>dashboard</Link>
          <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>logout</Link>
        </div>
        <p style={{ textAlign: 'center', margin: 0 }}>Current Account: {account}</p>
      </nav>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Medicine ID:</label>
          <input type="text" value={medicineId} onChange={(e) => setMedicineId(e.target.value)} />
        </div>
        {medicineDetails && (
          <div style={{ marginBottom: '20px' }}>
            <h2>Medicine Details</h2>
            <p>Name: {medicineDetails.name}</p>
            <p>Composition: {medicineDetails.composition}</p>
            {/* Render other details */}
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Manufacturer's Invoice:</label>
          <input type="file" onChange={(e) => setManufacturerFile(e.target.files[0])} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Wholesaler's Invoice:</label>
          <input type="file" onChange={(e) => setWholesalerFile(e.target.files[0])} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Distributor's Invoice:</label>
          <input type="file" onChange={(e) => setDistributorFile(e.target.files[0])} />
        </div>
        <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }} onClick={verifyIPFSHashes}>Verify IPFS Hashes</button>
        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
}

export default VerifyMedicine;
