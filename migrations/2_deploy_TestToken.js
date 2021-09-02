const testToken = artifacts.require("./TestToken.sol");
const testTokenSale = artifacts.require("./TestTokenSale.sol");

module.exports = async function(deployer) {
    await deployer.deploy(testToken, 1000000)
    _testToken = await testToken.deployed()
    await deployer.deploy(testTokenSale, _testToken.address, web3.utils.toWei('0.1', 'Ether'))
};
