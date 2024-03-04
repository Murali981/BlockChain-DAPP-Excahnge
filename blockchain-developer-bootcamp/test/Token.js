const {expect} = require('chai');
const {ethers} = require('hardhat'); // It imports the ethers library from the hardhat library....
// {ethers} => This curly braces{} is to destructure the ethers library....We are taking out (or) destructuring the ethers part from the 
// hardhat part that we have exported using the require('hardhat) function

const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString() , 'ether')
}

describe('Token' , () => {
    // Tests go inside here...
    let token , accounts , deployer , receiver , exchange ;
 
    beforeEach(async () => {
        //Step 1. Fetch token from the blockchain.....(Fetch the token smart contract with ethers.js)....
        const Token = await ethers.getContractFactory('Token'); // We are getting the token from the blockchain....
         token = await Token.deploy('Dapp University' , 'DAPP' , '1000000') // We will deploy it on the test blockchain....

         accounts = await ethers.getSigners(); // It will give all the 20 accounts that are connected to the hardhat account....
         deployer = accounts[0]; // The first account[0] is the deployer account here....
         receiver = accounts[1]; // The Second account[1] is the receiver account here....
         exchange = accounts[2]; // The Third account[2] is the exchange account here....
    })

    describe('Deployment' , () => {
      
     const name = 'Dapp University'
     const symbol = 'DAPP'
     const decimals = '18'
     const totalSupply = tokens('1000000')

        it('has correct name' , async  () => {
       
            //Step 2. Read token name....
           // const name = await token.name()
            // We will check whether the name is correct (or) not....
            expect(await token.name()).to.equal(name)
        })
    
        it('has correct symbol' , async  () => {
            //Step 2. Read token symbol....
            //const symbol = await token.symbol()
            // We will check whether the symbol is correct (or) not....
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it('has correct decimals' , async  () => {
            //Step 2. Read token decimals....
            //const decimal = await token.decimals()
            // We will check whether the decimals is correct (or) not....
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('has correct total supply' , async  () => {
           // const value = tokens('1000000')
            //Step 2. Read token supply....
            //const supply = await token.totalSupply()
            // We will check whether the total supply is correct (or) not....
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns total supply to the deployer' , async () => {
            console.log(deployer.address);
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        })
    })

    describe('Sending Tokens' , async () => {
        let amount , transaction , result;

        describe('Success' , () => {


            beforeEach(async () => {
                amount = tokens(100);
                 transaction = await token.connect(deployer).transfer(receiver.address , amount) // It takes the deployer wallet and connect it to the token smart contract....
                 result = await transaction.wait(); // It will wait until the entire transaction to finish.....
    
            })
    
    
            it('Transfers token balances' , async () => {
               // Log balance before transfer....
              // console.log("deployer balance before transfer" , await token.balanceOf(deployer.address));
              // console.log("receiver balance before transfer" , await token.balanceOf(receiver.address));
    
    
                // Transfer tokens
               
                
    
                // Ensure that tokens were transferred (balance changed)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
    
             
                // Log balance after transfer.........
               // console.log("deployer balance after transfer" , await token.balanceOf(deployer.address));
               // console.log("receiver balance after transfer" , await token.balanceOf(receiver.address));
    
            })
    
            it('Emits a transfer event' , async () => {
                const event = result.events[0];
                console.log(event);
                expect(event.event).to.equal('Transfer');
                const args = event.args;
                expect(args.from).to.equal(deployer.address);
                expect(args.to).to.equal(receiver.address);
                expect(args.value).to.equal(amount);
            })
    
        })
       
       describe('Failure' , () => {
          it('rejects insufficient balances' , async () => {
             // Transfer more token than the deployer has....Assume 100M tokens the deployer has as the balance....
             const invalidAmount = tokens(10000000);
             await expect(token.connect(deployer).transfer(receiver.address , invalidAmount)).to.be.reverted; // This await and expect
             // will come with the waffle library which we have already installed....

          })

          it('rejects Invalid recipient' , async () => {
            const amount = tokens(100);
            await expect(token.connect(deployer).transfer('0x00000000000000000000' , amount)).to.be.reverted; // This avoids sending 
            // tokens to some random address.....
          })
       }) 

    })

    describe('Approving Tokens' ,  () => {
        let amount , transaction , result;
        beforeEach(async () => {
            amount = tokens(100);
            transaction = await token.connect(deployer).approve(exchange.address , amount) // It takes the deployer wallet and connect it to the token smart contract....
            result = await transaction.wait(); // It will wait until the entire transaction to finish.....
    
        })
        
        describe('Success' , () => {

            it('allocates an allowance for delegated token spending' , async () => {
                expect(await token.allowance(deployer.address , exchange.address)).to.equal(amount); // Here the deployer address is the owner address
                // and the exchange address is the spender address......
            })

            it('emits an approval event' , async () => {
                const event = result.events[0];
                console.log(event);
                expect(event.event).to.equal('Approval');
                const args = event.args;
                expect(args.owner).to.equal(deployer.address);
                expect(args.spender).to.equal(exchange.address);
                expect(args.value).to.equal(amount);
            })

        })

        describe('Failure' , async () => {
            it('rejects invalid spenders' , async () => {
                await expect(token.connect(deployer).approve('0x00000000000000000000' , amount)).to.be.reverted;
            })
        })
    })

    describe('Delegated Token Transfers' , () => {
         let amount , transaction , result;
        beforeEach(async () => {
          amount = tokens(100);
          transaction = await token.connect(deployer).approve(exchange.address , amount) // It takes the deployer wallet and connect it to the token smart contract....
           result = await transaction.wait(); // It will wait until the entire transaction to finish.....

        })
        describe('Success' , () => {
            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address , receiver.address , amount) // It takes the deployer wallet and connect it to the token smart contract....
                 result = await transaction.wait(); // It will wait until the entire transaction to finish.....
      
              })

              it('transfers token balances' , async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('999900' , 'ether'))
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount);
              })

              it('resets the allowance' , async () => {
                 expect(await token.allowance(deployer.address , exchange.address)).to.be.equal(0); // Once we have 
                 // transferred the tokens in the wallet then we will set the allowance back to zero.....

              })

              it('Emits a transfer event' , async () => {
                const event = result.events[0];
                console.log(event);
                expect(event.event).to.equal('Transfer');
                const args = event.args;
                expect(args.from).to.equal(deployer.address);
                expect(args.to).to.equal(receiver.address);
                expect(args.value).to.equal(amount);
            })
        })

        describe('Failure' , async () => {
           // Attempts to transfer  too many tokens....
           const invalidAmount = tokens(100000000) // 100 million tokens which are greater than the total supply...
           await expect(token.connect(exchange).transferFrom(deployer.address , receiver.address , invalidAmount)).to.be.reverted;
        })
    })

    
})

it('Test', (done) => { 
    //your code  
    done();
    }).timeout(50000);

/*
it('resolves', (done) => {
    fooAsyncPromise(arg1, arg2).then((res, body) => {
        expect(res.statusCode).equal(incorrectValue);
        done();
    }).catch(done);
 });

 it('resolves', (done) => {
    resolvingPromise.then( (result) => {
      expect(result).to.equal('promise resolved');
    }).then(done, done);
  });

  it('resolves', () => {
    return resolvingPromise.then( (result) => {
      expect(result).to.equal('promise resolved');
    });
  });

  it('assertion success', async () => {
    const result = await resolvingPromise;
    expect(result).to.equal('promise resolved'); 
  }); */

