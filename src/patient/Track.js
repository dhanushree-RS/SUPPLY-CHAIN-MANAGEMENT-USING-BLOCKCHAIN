import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from '../artifacts/SupplyChain.json'; // Import your contract ABI

function Track() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [medicineId, setMedicineId] = useState('');
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Connect to Ethereum network and initialize contract
  useEffect(() => {
    const connectToBlockchain = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SupplyChainContract.networks[networkId];
        const contractInstance = new web3.eth.Contract(
          SupplyChainContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);
      } else {
        console.error('MetaMask not detected');
      }
    };

    connectToBlockchain();
  }, []);

  // Function to handle tracking medicine
  const handleTrackMedicine = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    setLoading(true);
    try {
      const result = await contract.methods.trackMedicine(medicineId).call();
      setMedicineDetails(result);
    } catch (error) {
      console.error('Error tracking medicine:', error);
    }
    setLoading(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">Pharma SupplyChain</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={styles.container}>
        <h1 style={styles.title}>Track Medicine</h1>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Medicine ID:</label>
          <input
            type="number"
            value={medicineId}
            onChange={(e) => setMedicineId(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleTrackMedicine} style={styles.button}>
            Track
          </button>
        </div>
        {loading && <p style={styles.loading}>Loading...</p>}
        {medicineDetails && (
          <div style={styles.detailsContainer}>
            <h2 style={styles.detailsTitle}>Tracking Details</h2>
            <p style={styles.detail}><strong>ID:</strong> {medicineDetails.id}</p>
            <p style={styles.detail}><strong>Name:</strong> {medicineDetails.name}</p>
            <p style={styles.detail}><strong>Description:</strong> {medicineDetails.description}</p>
            <p style={styles.detail}><strong>Current Status:</strong> {medicineDetails.currentStatus}</p>
            {/* Render other medicine details as needed */}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#686D76',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    color: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '20px',
    color: '#fff',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: '#444',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
  },
  label: {
    marginRight: '10px',
    fontSize: '18px',
    color: '#fff',
  },
  input: {
    flex: '1',
    padding: '8px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#555',
    color: '#fff',
  },
  button: {
    marginLeft: '10px',
    padding: '8px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    backgroundColor: '#C7B7A3',
    color: '#151515',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#fff',
  },
  detailsContainer: {
    marginTop: '30px',
    border: '1px solid #555',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#444',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  detailsTitle: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#EEEEEE',
  },
  detail: {
    marginBottom: '8px',
    fontSize: '16px',
    color: '#fff',
  },
};

export default Track;
