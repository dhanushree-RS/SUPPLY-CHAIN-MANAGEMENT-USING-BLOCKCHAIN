import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from './artifacts/SupplyChain.json';
import { create } from 'ipfs-http-client';
//import './css/allocatemedicine.css'; 
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
const AllocateMedicine = ({ contract }) => {
  const [account, setAccount] = useState('');
  const [medicineId, setMedicineId] = useState('');
  const [wholesalerName, setWholesalerName] = useState('');
  const [wholesalerAddress, setWholesalerAddress] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [allocatedMedicines, setAllocatedMedicines] = useState([]);
  const [Taxinvoiceipfshash, setTaxInvoiceIpfsHash] = useState('');

  const ipfs = create({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
  });


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
          setAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  const handleMedicineIdChange = async (e) => {
    setMedicineId(e.target.value);
  };

  // const handleFetchIpfsHash = async () => {
  //   try {
  //     console.log('Fetching IPFS hash...');
  //     const ipfsHashh = await contractInstance.methods.medicines(medicineId).call().then(medicine => medicine.ipfsHash);
  //     console.log('IPFS hash fetched:', ipfsHash);
  //     setIpfsHash(ipfsHash);
  //   } catch (error) {
  //     console.error('Error fetching IPFS hash:', error);
  //   }
  // };
  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const currentDate = new Date().toLocaleString(); // Get current date and time
  
      // Get medicine details from the contract
      const medicineDetails = await contractInstance.methods.medicines(medicineId).call();
  
      // Construct tax invoice data
      const taxInvoiceData = {
        manufacturerAddress: account, // Manufacturer's address
        currentDate: currentDate, // Current date and time
        medicineId: medicineId,
        prefix: medicineDetails.prefix,
        name: medicineDetails.name,
        description: medicineDetails.description,
        manufacturerDate: medicineDetails.manufacturerDate,
        expiryDate: medicineDetails.expiryDate,
        price: medicineDetails.price,
        composition: medicineDetails.composition,
        wholesalerAddress: wholesalerAddress,
        wholesalerName: wholesalerName,
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
      console.log('Tax Invoice PDF IPFS Hash:', taxInvoiceIpfsHash);
      setTaxInvoiceIpfsHash(taxInvoiceIpfsHash);
     
  
      // Allocate medicine with tax invoice PDF IPFS hash
      const transaction = await contractInstance.methods.allocateMedicine(
        medicineId,
        wholesalerAddress,
        taxInvoiceIpfsHash,
      
      ).send({ from: account });
  
      console.log('Transaction Hash:', transaction.transactionHash);
      setTransactionHash(transaction.transactionHash);
      const newAllocatedMedicine = {
        medicineId: medicineId,
        wholesalerName: wholesalerName,
        wholesalerAddress: wholesalerAddress,
        taxInvoiceIpfsHash: Taxinvoiceipfshash,
      };
      setAllocatedMedicines([...allocatedMedicines, newAllocatedMedicine]);
      console.log("Allocated Medicines:", allocatedMedicines);

      // Reset form fields
      setMedicineId('');
      setWholesalerName('');
      setWholesalerAddress('');
    } catch (error) {
      console.error('Error allocating medicine:', error);
    }
  };
  return (
    <div>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#333', color: '#fff', padding: '5px 20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Pharma SupplyChain</h1>
        <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
          <li style={{ marginLeft: 'auto' }}>
            <a href="/allocatemedicine" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>allocate medicine</a>
          </li>
          <li>
            <a href="/viewwholesaler" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>viewwholesaler</a>
          </li>
          <li>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>logout</a>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <div className="allocate-medicine-container">
        <h2 style={{textAlign:'center',paddingBottom:'60px'}}>Allocate Medicine</h2>
        <form className="allocate-medicine-form" onSubmit={handleAllocate} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="medicineId">Medicine ID:</label>
            <input type="number" id="medicineId" value={medicineId} onChange={(e) => setMedicineId(e.target.value)} style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="wholesalerName">Wholesaler Name:</label>
            <input type="text" id="wholesalerName" value={wholesalerName} onChange={(e) => setWholesalerName(e.target.value)} style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="wholesalerAddress">Wholesaler Address:</label>
            <input type="text" id="wholesalerAddress" value={wholesalerAddress} onChange={(e) => setWholesalerAddress(e.target.value)} style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" className="allocate-button" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Allocate</button>
        </form>
      {/* {ipfsHash && <p>IPFS Hash: {taxInvoiceIpfsHash}</p>}  */}
      {Taxinvoiceipfshash && (
  <p style={{ textAlign: 'center' }}>
    Tax Invoice :{" "}
    <a href={`http://127.0.0.1:8080/ipfs/${Taxinvoiceipfshash}`} target="_blank" rel="noopener noreferrer">
      click here!
    </a>
  </p>
)}

      {/* <div>
          <h2>Allocated Medicines</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Wholesaler Name</th>
                <th>Wholesaler Address</th>
                <th>IPFS Hash</th>
              </tr>
            </thead>
            <tbody>
              {allocatedMedicines.map((medicine, index) => (
                <tr key={index}>
                  <td>{medicine.medicineId}</td>
                  <td>{medicine.wholesalerName}</td>
                  <td>{medicine.wholesalerAddress}</td>
                  <td>{medicine.ipfsHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>
      
    </div>
  );
};
export default AllocateMedicine;
