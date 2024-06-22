
## ENHANICNG SUPPLY CHAIN EFFICIENCY THROUGH BLOCKCHAIN IN PHARMACEUTICAL INDUSTRY

## Overview

This project aims to enhance the efficiency and security of the pharmaceutical supply chain using blockchain technology. By implementing a decentralized application (DApp) with Ethereum, smart contracts, and InterPlanetary File System (IPFS), we aim to address the issues of counterfeit drugs, lack of transparency, and inefficiencies within the supply chain.

## Features

- **Blockchain Integration:** Ensures secure, immutable records of transactions.
- **Smart Contracts:** Automate compliance and verification processes.
- **IPFS Storage:** Decentralized storage for critical data, enhancing security and accessibility.
- **QR Code Authentication:** Unique QR codes for each medication to verify authenticity and traceability.

## Technologies Used

- **Ethereum:** Platform for deploying smart contracts.
- **IPFS:** Decentralized file storage system.
- **Ganache:** Local blockchain for testing.
- **Truffle:** Development framework for Ethereum.
- **MetaMask:** Digital wallet for managing transactions.

## System Architecture

1. **Registration of Stakeholders:** Involves manufacturers, wholesalers, distributors, pharmacies, and patients.
2. **Medicine Creation and Tracking:** From production to end-user, ensuring transparency at each step.
3. **Smart Contract Deployment:** Governs the operations within the DApp.
4. **Verification:** Ensures the authenticity of medications through QR codes and blockchain records.

## Installation and Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/yourrepository.git
   cd yourrepository
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Ganache:**
   ```bash
   ganache-cli
   ```

4. **Compile and Deploy Contracts:**
   ```bash
   truffle compile
   truffle migrate
   ```

5. **Run the DApp:**
   ```bash
   npm start
   ```

## Usage

1. **Register as a Stakeholder:** Users can register as different stakeholders in the supply chain.
2. **Add Medication Details:** Manufacturers can add details of the medicines produced.
3. **Verify Medications:** Stakeholders can verify the authenticity and trace the journey of medications using QR codes.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

