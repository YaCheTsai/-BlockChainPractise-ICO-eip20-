const TestTokenSale = artifacts.require('./TestTokenSale.sol');
const TestToken = artifacts.require('./TestToken.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('TestTokenSale', (accounts) =>{
    let testTokenSale, testToken
    let tokenPrice = web3.utils.toWei('0.1', 'Ether')

    before(async () => {
        testTokenSale = await TestTokenSale.deployed()
        
    })

    describe('deployment', async () =>{
      
        it('has a address', async () => {
            const address = await testTokenSale.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a tokenContract', async () => {
            const tokenContract = await testTokenSale.tokenContract()
            assert.notEqual(tokenContract, 0x0)
            
        })

        it('has a tokenPrice', async () => {
            const price = await testTokenSale.tokenPrice()
            assert.equal(price, tokenPrice)
        })

       
    })

    describe('facilitates token buying', async () =>{
        

        it('buying', async () => {
            testToken = await TestToken.deployed()
            await testToken.transfer(testTokenSale.address, 750000, {from: accounts[0]})
            const count = await testToken.balanceOf(testTokenSale.address)
            assert.equal(count, 750000, 'testTokenSale token count')

            let numOfToken = 10
            let value = numOfToken * tokenPrice
            await testTokenSale.buyTokens(numOfToken, {from: accounts[1], value: 1}).should.be.rejected 
            await testTokenSale.buyTokens(7500000, {from: accounts[1], value: value}).should.be.rejected 
            
            const result = await testTokenSale.buyTokens(numOfToken, {from: accounts[1], value: value})
            const event = result.logs[0].args
            assert.equal(event._buyer, accounts[1], 'send from is correct')
            assert.equal(event._amount, numOfToken, 'amount to is correct')

            const newContractHas = await testToken.balanceOf(testTokenSale.address)
            assert.equal(newContractHas, 750000 - numOfToken, 'testTokenSale token count')
            const newAccs1Has = await testToken.balanceOf(accounts[1])
            assert.equal(newAccs1Has, numOfToken, 'testTokenSale token count')
        })

       
    })
    describe('ending the contract', async () =>{
        

        it('ending', async () => {
            await testTokenSale.endSale({from: accounts[1]}).should.be.rejected 
            await testTokenSale.endSale({from: accounts[0]})
            
            const adminCount = await testToken.balanceOf(accounts[0])
         
            assert.equal(adminCount, 999990 , 'remaining token count')

            //assert.equal(tokenSold.toNumber(), 0, 'remaining token count')

        })
    })
})