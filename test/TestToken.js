const TestToken = artifacts.require('./TestToken.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('TestToken', (accounts) =>{
    let testToken 

    before(async () => {
        testToken = await TestToken.deployed()
    })

    describe('deployment', async () =>{
        it('Sets the tatal supply upon deployment', async () =>{
            const totalSupply = await testToken.totalSupply()
            assert.equal(totalSupply.toNumber(), 1000000)
        })

        it('has a address', async () => {
            const address = await testToken.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('admin account', async () => {
            const balance = await testToken.balanceOf(accounts[0])
            assert.equal(balance.toNumber(), 1000000, 'it alloocates the initial supply to the admin account')
        })

        it('init the contract with the correct values', async () => {
            const name = await testToken.name()
            const symbol = await testToken.symbol()
            const standard = await testToken.standard()
            assert.equal(name.toString(), 'Test Token', 'has the correct Token name')
            assert.equal(symbol.toString(), 'Test', 'has the correct Symbol!!')
            assert.equal(standard.toString(), 'Test Token v1.0', 'has the correct standard!!')
        })
    })

    describe('Transfers', async () =>{
        it('Transfers token ownership', async () =>{
            await testToken.transfer(accounts[1], 99999999999999999999999999999).should.be.rejected 

            const result = await testToken.transfer(accounts[1], 250000, {from: accounts[0]}) 
            const success = await testToken.transfer.call(accounts[1], 250000, {from: accounts[0]})
            assert.equal(success, true, 'return is correct')
            
            assert.equal(result.logs.length, 1, 'length is correct')
            assert.equal(result.logs[0].event, 'Transfer', 'event is correct')

            const event = result.logs[0].args
            assert.equal(event._from, accounts[0], 'send from is correct')
            assert.equal(event._to, accounts[1], 'send to is correct')
            assert.equal(event._value.toNumber(), 250000, 'price is correct')
          
            const balance0 = await testToken.balanceOf(accounts[0])
            assert.equal(balance0.toNumber(), 750000, 'deducts the amount from the sending account')
            const balance1 = await testToken.balanceOf(accounts[1])
            assert.equal(balance1.toNumber(), 250000, 'adds the amount to the receiviing account')

        })
    })

    describe('Approval/allowance', async () =>{
        it('Approval tokens for delegate transfer', async () =>{
            
            const success = await testToken.approval.call(accounts[1], 100, {from:accounts[0]})
            assert.equal(success, true, 'return is correct')
            
            const result = await testToken.approval(accounts[1], 100,  {from:accounts[0]}) 
            assert.equal(result.logs.length, 1, 'length is correct')
            assert.equal(result.logs[0].event, 'Approval', 'event is correct')
            const event = result.logs[0].args
            assert.equal(event._owner, accounts[0], 'send from is correct')
            assert.equal(event._spender, accounts[1], 'send to is correct')
            assert.equal(event._value, 100, 'price is correct')
            
        })
        it('allowance tokens for delegate transfer', async () =>{
            const allowance = await testToken.allowance(accounts[0], accounts[1])
            assert.equal(allowance, 100, 'store allowance for delegate trasnfer')
        })

    })

    describe('handles delegrate transfer', async () =>{
        let fromAcc = accounts[2]
        let toAcc = accounts[3]
        let spendingAcc = accounts[4]
        
        it('transfer 100 from deployer to fromAcc', async () =>{
           
            const result = await testToken.transfer.call(fromAcc, 100, {from: accounts[0]})
            assert.equal(result, true, 'transfer is correct')
            await testToken.transfer(fromAcc, 100, {from: accounts[0]})
        })

        it('approval spendingAcc spend 10 from fromAcc ', async () =>{
            const result1 = await testToken.approval.call(spendingAcc, 10, {from: fromAcc})
            assert.equal(result1, true, 'approval is correct')
            await testToken.approval(spendingAcc, 10, {from: fromAcc})
        })   

        it('transferFrom ', async () =>{
            await testToken.transferFrom(fromAcc, toAcc, 99999, {from: spendingAcc}).should.be.rejected 

            const success = await testToken.transferFrom.call(fromAcc, toAcc, 10, {from: spendingAcc})
            assert.equal(success, true, 'return is correct')
            const result3 = await testToken.transferFrom(fromAcc, toAcc, 10, {from: spendingAcc})

            assert.equal(result3.logs.length, 1, 'length is correct')
            assert.equal(result3.logs[0].event, 'Transfer', 'event is correct')

            const event = result3.logs[0].args
            
            assert.equal(event._from, fromAcc, 'send from is correct')
            assert.equal(event._to, toAcc, 'send to is correct')
            assert.equal(event._value, 10, 'price is correct')

            const balance0 = await testToken.balanceOf(fromAcc)
            assert.equal(balance0.toNumber(), 90, 'deducts the amount from the sending account')
            const balance1 = await testToken.balanceOf(toAcc)
            assert.equal(balance1.toNumber(), 10, 'adds the amount to the receiviing account')

            const allowance = await testToken.allowance(fromAcc, spendingAcc)
            assert.equal(allowance, 0, 'store allowance for delegate trasnfer')

        })
    })
    

})