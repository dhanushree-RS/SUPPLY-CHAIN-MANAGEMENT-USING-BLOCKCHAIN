import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; // Import Web3 library
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { create } from 'ipfs-http-client';

// Import your contract ABI (replace 'YourContractABI' with your actual ABI)
import contractABI from '../artifacts/SupplyChain.json';

const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
});


// Initialize Web3
const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545'); // Use the provider of your choice or fallback to localhost

function ShipMedicineToHospital() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractInstance, setContractInstance] = useState(null); // State to store contract instance
  const [accountAddress, setAccountAddress] = useState(null);
  const [hospitalName, setHospitalName] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
 // const [loading, setLoading] = useState(true);

  useEffect(() => {
    connectToBlockchain();
  }, []);

  useEffect(() => {
    const storedMedicines = sessionStorage.getItem('medicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
      setLoading(false);
    }
  }, []);

  const connectToBlockchain = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();
         const accounts = await web3Instance.eth.getAccounts();
        setAccountAddress(accounts[0]);
        const deployedNetwork = contractABI.networks[networkId];
        const contract = new web3Instance.eth.Contract(
          contractABI.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContractInstance(contract);
        fetchMedicines(contract); // Call fetchMedicines after contract instance is set
      } catch (error) {
        console.error('Error connecting to blockchain:', error);
      }
    } else {
      console.error('MetaMask not detected');
    }
  };

  const fetchMedicines = async (contract) => {
    if (contract) {
      try {
        const medicineCount = await contract.methods.medicineCount().call();
        const medicinesArray = [];
        for (let i = 1; i <= medicineCount; i++) {
          const medicine = await contract.methods.medicines(i).call();
          medicinesArray.push(medicine);
        }
        console.log(medicinesArray);
        setMedicines(medicinesArray);
        setLoading(false);
        sessionStorage.setItem('medicines', JSON.stringify(medicinesArray));
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    }
  };
  

  const allocateToHospital = async (medicineId, hospitalAddress, hospitalName) => {
    if (contractInstance) {
      try {
        const currentDate = new Date().toLocaleString(); // Get current date and time
  
      // Get medicine details from the contract
      const medicineDetails = await contractInstance.methods.medicines(medicineId).call();
  
      // Construct tax invoice data
      const taxInvoiceData = {
        distributorAddress: accountAddress, // Manufacturer's address
        currentDate: currentDate, // Current date and time
        medicineId: medicineId,
        prefix: medicineDetails.prefix,
        name: medicineDetails.name,
        description: medicineDetails.description,
        manufacturerDate: medicineDetails.manufacturerDate,
        expiryDate: medicineDetails.expiryDate,
        price: medicineDetails.price,
        composition: medicineDetails.composition,
        HospitalAddress: hospitalAddress,
        HospitalName: hospitalName,
      };
  
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Draw company name "BAYER MANUFACTURING LTD" at the top center
      page.drawText('BAYER MANUFACTURING LTD', {
        x: width / 2 - 100, // Adjust as needed for center alignment
        y: height - 50,
        size: 18,
        font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        color: rgb(0, 0, 0),
        lineHeight: 24,
      });
      
      // Add current date on the top right
      const date = new Date().toLocaleDateString();
      page.drawText(`Date: ${date}`, {
        x: width - 200, // Adjust as needed for right alignment
        y: height - 80,
        size: 12,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
      });
      
      // Add current time on the top right below the date
      const time = new Date().toLocaleTimeString();
      page.drawText(`Time: ${time}`, {
        x: width - 200, // Adjust as needed for right alignment
        y: height - 70, // Adjust the y-coordinate to place below the date
        size: 12,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
      });
      
      // Add tax invoice data
      let yOffset = height - 100;
      for (const [key, value] of Object.entries(taxInvoiceData)) {
        if (key === 'medicineDetails') {
          // Print medicine details separately
          const medicineDetailsString = JSON.stringify(value);
          page.drawText(`${key}: ${medicineDetailsString}`, {
            x: 50,
            y: yOffset,
            size: 15,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(0, 0, 0),
          });
        } else {
          // Print other data normally
          page.drawText(`${key}: ${value}`, {
            x: 50,
            y: yOffset,
            size: 15,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(0, 0, 0),
          });
        }
        yOffset -= 20;
      }
      
      // Serialize PDF
      const pdfBytes = await pdfDoc.save();
      

  
      // Upload PDF to IPFS
      const ipfsResult = await ipfs.add(pdfBytes,medicineId);
      const taxInvoiceIpfsHash = ipfsResult.path;
      setIpfsHash(taxInvoiceIpfsHash);
      console.log('Tax Invoice PDF IPFS Hash:', taxInvoiceIpfsHash);
     
        // Call the allocateMedicineToHospital function
        await contractInstance.methods.allocateMedicineToHospital(medicineId, hospitalAddress, taxInvoiceIpfsHash).send({ from: accountAddress });
        alert('Medicine allocated to hospital successfully!');
        // Refresh medicines list after allocation
        //fetchMedicines(contractInstance);
      } catch (error) {
        console.error('Error allocating medicine to hospital:', error);
        alert('Error allocating medicine to hospital. Please check the console for details.');
      }
    }
  };

  const shipMedicine = async (medicineId) => {
    if (contractInstance) {
      try {
        // Call the shipMedicineToHospital function
        await contractInstance.methods.shipMedicineToHospital(medicineId).send({ from: accountAddress });
        alert('Medicine shipped successfully!');
        // Refresh medicines list after shipping
        fetchMedicines(contractInstance);
      } catch (error) {
        console.error('Error shipping medicine:', error);
        alert('Error shipping medicine. Please check the console for details.');
      }
    }
  };

  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">Pharma SupplyChain</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/distributor">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/track">Track Medicines</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    <div style={{ margin: '20px' }}>
  <h2 style={{ marginTop: '20px' }}>SHIP MEDICINES TO HOSPITALS</h2>
  {loading ? (
    <p>Loading medicines...</p>
  ) : (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {medicines.map((medicine) => (
        (medicine.currentStatus === 'Quality Checked' || medicine.currentStatus === 'InTransit') && (
          <li key={medicine.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
            <div>
              <strong>Name: </strong>{medicine.name}<br />
              <strong>Description: </strong>{medicine.description}<br />
              <strong>Manufacturer Date: </strong>{medicine.manufacturerDate}<br />
              <strong>Expiry Date: </strong>{medicine.expiryDate}<br />
              <strong>Price: </strong>{medicine.price}<br />
              <strong>Status: </strong>{medicine.currentStatus}<br />
              <button onClick={() => allocateToHospital(medicine.id, '0x11a69C9491406f8B624F1581bac4f986590DA8bB','SURYA HOSPITALS')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' }}>Allocate to Hospital</button>
              <button onClick={() => shipMedicine(medicine.id)} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', marginTop: '10px', marginLeft: '10px', cursor: 'pointer' }}>Ship Medicine</button>
            </div>
          </li>
        )
      ))}
    </ul>
  )}

{ipfsHash && (
  <p style={{ textAlign: 'center' }}>
    Tax Invoice:{" "}
    <a href={`http://127.0.0.1:8080/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer">
      click here!
    </a>
  </p>
)}
  
</div>
</>

  );}

export default ShipMedicineToHospital;
