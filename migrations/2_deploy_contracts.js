const ConvertLib = artifacts.require("ConvertLib");
const MetaCoin = artifacts.require("ballot");

module.exports = function(deployer) {
  deployer.deploy(MetaCoin, 5);
};
