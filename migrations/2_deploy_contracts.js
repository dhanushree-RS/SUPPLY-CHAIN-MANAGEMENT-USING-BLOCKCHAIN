const SupplyChains = artifacts.require("SupplyChain");

module.exports = function (deployer) {
  deployer.deploy(SupplyChains);
};
