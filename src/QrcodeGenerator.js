import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import Web3 from 'web3';
import SupplyChain from './artifacts/SupplyChain.json';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { create } from 'ipfs-http-client';
import './css/qr.css';

const QrCodeGenerator = () => {
  const [web3, setWeb3] = useState(null);
  const [SupplyChainContract, setSupplyChainContract] = useState(null);
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [medicinePrefix, setMedicinePrefix] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [medDescription, setMedDescription] = useState('');
  const [manufacDate, setManufacDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [price, setPrice] = useState('');
  const [composition, setComposition] = useState('');
  const [addedMedicine, setAddedMedicine] = useState(null);
  const [medicineList, setMedicineList] = useState([]);
  const navigate = useNavigate();

  const ipfs = create({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
  });

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const _web3 = new Web3(window.ethereum);
        setWeb3(_web3);
        try {
          await window.ethereum.enable();
          const accounts = await _web3.eth.getAccounts();
          console.log(accounts);
          setManufacturerAddress(accounts[0]);
        } catch (error) {
          console.error('User denied account access');
        }
      } else {
        console.error('No Ethereum browser detected');
      }
    }
    loadWeb3();
  }, []);

  useEffect(() => {
    async function loadContract() {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SupplyChain.networks[networkId];
        const _contract = new web3.eth.Contract(
          SupplyChain.abi,
          deployedNetwork && deployedNetwork.address
        );
        setSupplyChainContract(_contract);
      }
    }
    loadContract();
  }, [web3]);

  const downloadQRCode = async (content, filename) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(content));

      const downloadLink = document.createElement('a');
      downloadLink.href = qrCodeDataURL;
      downloadLink.download = `${filename}.png`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error generating and downloading QR code:', error);
    }
  };

  const uploadToIPFS = async (data) => {
    try {
      const { path } = await ipfs.add(JSON.stringify(data));
      return path;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const addMedicine = async () => {
    if (SupplyChainContract) {
      const userDetails = {
        prefix: medicinePrefix,
        name: medicineName,
        composition: composition,
        description: medDescription,
        manufacturerDate: manufacDate,
        expiryDate: expiryDate,
        price: price,
        manufacturer: manufacturerAddress,
        currentStatus: 'Manufacturing',
      };

      try {
        const ipfsHash = await uploadToIPFS(userDetails);
        console.log(ipfsHash);
        const result = await SupplyChainContract.methods
          .createMedicine(
            medicinePrefix,
            medicineName,
            composition,
            medDescription,
            manufacDate,
            expiryDate,
            price,
            ipfsHash
          )
          .send({ from: manufacturerAddress });

        if (result && result.events && result.events.MedicineCreated) {
          const addedMedicineId = result.events.MedicineCreated.returnValues.id;

          const addedMedicineDetails = await SupplyChainContract.methods
            .medicines(addedMedicineId)
            .call();

          setAddedMedicine({ ...addedMedicineDetails, id: addedMedicineId });
          setMedicineList((prevMedicineList) => [
            ...prevMedicineList,
            { ...addedMedicineDetails, id: addedMedicineId },
          ]);
          console.log(addedMedicineDetails);
        } else {
          console.error('Error adding medicine: Event not found in transaction result');
        }
      } catch (error) {
        console.error('Error while adding medicine:', error.message);
      }
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Pharma Supply Chain
          </Link>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/viewmed">
                  View Medicine
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/viewwholesaler">
                  View Wholesaler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/allocatemedicine">
                  Allocate Medicine
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="form-container">
          <h2>Manufacturer Dashboard</h2>
          <form>
            <div className="form-row">
              <label htmlFor="medicinePrefix">Medicine Prefix:</label>
              <input
                type="text"
                id="medicinePrefix"
                value={medicinePrefix}
                onChange={(e) => setMedicinePrefix(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="medicineName">Medicine Name:</label>
              <input
                type="text"
                id="medicineName"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="composition">Composition:</label>
              <input
                type="text"
                id="composition"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="medDescription">Medicine Description:</label>
              <input
                type="text"
                id="medDescription"
                value={medDescription}
                onChange={(e) => setMedDescription(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="manufacDate">Manufacturer Date:</label>
              <input
                type="date"
                id="manufacDate"
                value={manufacDate}
                onChange={(e) => setManufacDate(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="expiryDate">Expiry Date:</label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="price">Price:</label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="button-container">
              <button type="button" onClick={addMedicine}>
                Add Medicine
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        
        {medicineList.map((medicine) => (
          <div key={medicine.id.toString()} className="medicine-details">
            <h3 className="mt-4 mb-2">Medicine List:</h3>
            <p>
              <strong>ID:</strong> {medicine.id.toString()}
            </p>
            <p>
              <strong>Prefix:</strong> {medicine.prefix}
            </p>
            <p>
              <strong>Name:</strong> {medicine.name}
            </p>
            <p>
              <strong>Description:</strong> {medicine.description}
            </p>
            <p>
              <strong>Manufacturer Date:</strong> {medicine.manufacturerDate}
            </p>
            <p>
              <strong>Expiry Date:</strong> {medicine.expiryDate}
            </p>
            <p>
              <strong>Price:</strong> {medicine.price.toString()}
            </p>
            <p>
              <strong>Composition:</strong> {medicine.composition}
            </p>
            <p>
              <strong>Current Status:</strong> {medicine.currentStatus}
            </p>
            <div className="qr-code">
              <QRCode value={JSON.stringify(medicine)} size={128} />
              <button
                className="btn btn-primary ml-2"
                onClick={() => downloadQRCode(medicine, `medicine-${medicine.id}`)}
              >
                Download QR Code
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
