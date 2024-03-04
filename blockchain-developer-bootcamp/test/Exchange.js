const {expect} = require('chai');
const {ethers} = require('hardhat'); // It imports the ethers library from the hardhat library....
// {ethers} => This curly braces{} is to destructure the ethers library....We are taking out (or) destructuring the ethers part from the 
// hardhat part that we have exported using the require('hardhat) function

const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString() , 'ether')
}

describe('Exchange' , () => {
    // Tests go inside here...
    let deployer , feeAccount , exchange ;

    const feePercent = 10;
 
    beforeEach(async () => {

        const Exchange = await ethers.getContractFactory('Exchange'); // We are getting the token from the blockchain....
        const Token = await ethers.getContractFactory('Token'); // We are getting the token from the blockchain....

        token1 = await Token.deploy('Dapp University' , 'DAPP' , '1000000') // Total supply of token1 which are DAPP tokens are 1 million('1000000')
        token2 = await Token.deploy('Mock Dai' , 'mDAI' , '1000000') // Total supply of token2 which are mDAI tokens are 1 million('1000000')
        
         accounts = await ethers.getSigners(); // It will give all the 20 accounts that are connected to the hardhat account....
         deployer = accounts[0]; // The first account[0] is the deployer account here....
         feeAccount = accounts[1]; // The Second account[1] is the feeAccount's account here....
         user1 = accounts[2]; // user is depositing the tokens to the exchange...
         user2 = accounts[3]; 
 

         let transaction = await token1.connect(deployer).transfer(user1.address , tokens(100))
         await transaction.wait()
         
         //Step 1. Fetch token from the blockchain.....(Fetch the token smart contract with ethers.js)....
        
        exchange = await Exchange.deploy(feeAccount.address , feePercent) // We will deploy it on the test blockchain....



    })

    describe('Deployment' , () => {
      

        it('tracks the fee account' , async  () => {
       
            //Step 2. Read token name....
           // const name = await token.name()
            // We will check whether the name is correct (or) not....
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        
        it('it tracks the fee percent' , async  () => {
       
            //Step 2. Read token name....
           // const name = await token.name()
            // We will check whether the name is correct (or) not....
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    
    })


    describe('Depositing tokens' , () => {

        let transaction , result
        let amount = tokens(10); // Depositing 10 tokens for this example..
   
         describe('Success' , () => {

            beforeEach(async () => {
            
                console.log(user1.address , exchange.address , amount.toString())
                
                
                // Approve token
    
                transaction = await token1.connect(user1).approve(exchange.address , amount)
                result = await transaction.wait() // We are waiting for the transaction to finish..
                // Deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address , amount)
                result = await transaction.wait()
       
       
           })
            it('tracks the token deposit' , async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address , user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(amount)
            })

            it('emits a Deposit event' , async () => {
                const event = result.events[1]; // 2 events are emitted...
                console.log(event);
                expect(event.event).to.equal('Deposit');
                const args = event.args;
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(amount);
            })
        })

        describe('Failure' , () => {
            it('fails when no tokens are approved' , async () => {
                // Don't approve any tokens before depositing....
                await expect(exchange.connect(user1).depositToken(token1.address , amount)).to.be.reverted
            })
        })
    })




    describe('Withdrawing Tokens' , () => {

        let transaction , result
        let amount = tokens(10); // Depositing 10 tokens for this example..
   
         describe('Success' , () => {

            beforeEach(async () => {
            
                console.log(user1.address , exchange.address , amount.toString())

                // Deposit tokens before withdrawing....

                
                // Approve token
    
                transaction = await token1.connect(user1).approve(exchange.address , amount)
                result = await transaction.wait() // We are waiting for the transaction to finish..
                // Deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address , amount)
                result = await transaction.wait()


                // Now withdraw the tokens....
                transaction = await exchange.connect(user1).withdrawToken(token1.address , amount)
                result = await transaction.wait()
       
           })
            it('withdraws token funds' , async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address , user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(0)
            })

            it('emits a Withdraw event' , async () => {
                const event = result.events[1]; // 2 events are emitted...
                console.log(event);
                expect(event.event).to.equal('Withdraw');
                const args = event.args;
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(0);
            }) 
        })

        describe('Failure' , () => {
            it('fails for insufficient balances' , async () => {
                // Attempt to withdraw tokens without depositing.....
                await expect(exchange.connect(user1).withdrawToken(token1.address , amount)).to.be.reverted
            }) 
        })
    })

    describe('Checking Balances' , () => {

        let transaction , result
        let amount = tokens(1); // Depositing 1 token for this example..
   

            beforeEach(async () => {
            
                console.log(user1.address , exchange.address , amount.toString())
                
                
                // Approve token
    
                transaction = await token1.connect(user1).approve(exchange.address , amount)
                result = await transaction.wait() // We are waiting for the transaction to finish..
                // Deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address , amount)
                result = await transaction.wait()
       
       
           })
            it('returns user balance' , async () => {
                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(amount)
            })
       })


       describe('Making orders' , async () => {
           let transaction , result ;

           let amount = tokens(1); // Depositing 1 token for this example..

            describe('Success' , async () => {
              beforeEach(async () => { // beforeEach runs for each test example.....
                   // Deposit tokens before making order....

                
                // Approve token
    
                transaction = await token1.connect(user1).approve(exchange.address , amount)
                result = await transaction.wait() // We are waiting for the transaction to finish..

                // Deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address , amount)
                result = await transaction.wait()
 
                 // Make order
                 transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address , tokens(1))
                 result = await transaction.wait()

              })

              it('Tracks the newly created order' , async () => {
                  expect(await exchange.orderCount()).to.equal(1)
              })

              it('emits an Order event' , async () => {
                const event = result.events[0]; // 2 events are emitted...
                console.log(event);
                expect(event.event).to.equal('Order');
                const args = event.args;
                expect(args.id).to.equal(1)
                expect(args.user).to.equal(user1.address)
                expect(args.tokenGet).to.equal(token2.address);
                expect(args.amountGet).to.equal(tokens(1));
                expect(args.tokenGive).to.equal(token1.address);
                expect(args.amountGive).to.equal(tokens(1));
                expect(args.timestamp).to.at.least(1)
            })

       })

           describe('Failure' , async () => {
               it('Rejects orders with no balance' , async () => {
                await expect(exchange.connect(user1).makeOrder(token2.address , tokens(1) , token1.address , tokens(1))).to.be.reverted
               })
           })
       })

       describe('Order actions' , async () => {
          
          let transaction , result

          let amount = tokens(1) // We are depositing just one token....

           beforeEach(async () => {
             
              // User1 deposits the tokens 
              transaction = await token1.connect(user1).approve(exchange.address , amount)
              result = await transaction.wait()

              transaction = await exchange.connect(user1).depositToken(token1.address , amount)
              result = await transaction.wait()

              // Give tokens to User2
              transaction = await token2.connect(deployer).transfer(user2.address , tokens(100))
              result = await transaction.wait()

              // User2 deposits tokens onto the exchange but before depositing the tokens we will approve the tokens first......
              transaction = await token2.connect(user2).approve(exchange.address , tokens(2)) // We are approving two tokens (tokens(2)).........
              result = await transaction.wait()

              // User2 tokens are deposited now onto the exchange....
              transaction = await exchange.connect(user2).depositToken(token2.address , tokens(2))
              result = await transaction.wait()


              // Make an order
              transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address , amount)
              result = await transaction.wait()
           })
           
             describe('Cancelling orders' , async () => {

                   describe('Success' , async () => {

                      beforeEach(async () => {
                        transaction = await exchange.connect(user1).cancelOrder(1) // We are passing the order no 1 to cancel the order....
                        result = await transaction.wait()
                      })

                      it('updates cancelled orders' , async () => {
                        expect(await exchange.orderCancelled(1)).to.equal(true)
                      })

                      it('emits a Cancel event' , async () => {
                        const event = result.events[0]; // 2 events are emitted...
                        console.log(event);
                        expect(event.event).to.equal('Cancel');
                        const args = event.args;
                        expect(args.id).to.equal(1)
                        expect(args.user).to.equal(user1.address)
                        expect(args.tokenGet).to.equal(token2.address);
                        expect(args.amountGet).to.equal(tokens(1));
                        expect(args.tokenGive).to.equal(token1.address);
                        expect(args.amountGive).to.equal(tokens(1));
                        expect(args.timestamp).to.at.least(1)
                    })

                   })

                   describe('Failure' , async () => {

                    beforeEach(async () => {
                          // user1 deposits tokens...
                          transaction = await token1.connect(user1).approve(exchange.address , amount)
                          result = await transaction.wait()
                        transaction = await exchange.connect(user1).depositToken(token1.address , amount)
                        result = await transaction.wait()
                        // Make an order
                        transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address , amount)
                        result = await transaction.wait()
                      })
                      
                       it('rejects invalid order ids' , async () => {
                         
                           // Check Invalid order...
                           const invalidOrderId = 99999
                           await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
                       })

                       it('rejects unauthorized cancellations' , async () => {
                        await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
                       })
                   })
             })

             describe('Filling orders' , async () => {
       
                  describe('Success' , () => {
                    beforeEach(async () => {
                        // User2 fills the order
                        transaction = await exchange.connect(user2).fillOrder('1') // User2 is filling the order no 1...
                        result = await transaction.wait()
                      })
    
    
                     
                    it('executes the trade and charges the fees' , async () => {
                          // Ensures that the trade is happenned...
                          // Token give
                          expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(tokens(0)) // After executing the trade user1(1DAPP token deducted from user1 account) should have zero tokens......
                          expect(await exchange.balanceOf(token1.address , user2.address)).to.equal(tokens(1)) // After executing the trade user2(1DAPP token added(or) deposited to user2 account) should have one token added to his balance.....
                          expect(await exchange.balanceOf(token1.address , feeAccount.address)).to.equal(tokens(0)) // In this trade feeAccount will not get any tokens from user1 but it will get tokens only from user2 after completing the trade which is 10% of mDAI token(0.1%mDAI)....
    
                          // Token get
                          expect(await exchange.balanceOf(token2.address , user1.address)).to.equal(tokens(1))
                          expect(await exchange.balanceOf(token2.address , user2.address)).to.equal(tokens(0.9))
                          expect(await exchange.balanceOf(token2.address , feeAccount.address)).to.equal(tokens(0.1))
    
                        })
    
    
                        it('updates filled orders' , async () => {
                            expect(await exchange.orderFilled(1)).to.equal(true)
                        })
    
                    it('emits a Trade event' , async () => {
                        const event = result.events[0]
                        expect(event.event).to.equal('Trade') // We are telling the event name should be trade....
    
                        const args = event.args
                        expect(args.id).to.equal(1) // OrderID should be equal to one....
                        expect(args.user).to.equal(user2.address) // Here the user should be user2 because he is the one who is filling the trade.....
                        expect(args.tokenGet).to.equal(token2.address);
                        expect(args.amountGet).to.equal(tokens(1));
                        expect(args.tokenGive).to.equal(token1.address);
                        expect(args.amountGive).to.equal(tokens(1));
                        expect(args.creator).to.equal(user1.address);
                        expect(args.timestamp).to.at.least(1) // Time stamp should be atleast one....
                    })
                  })

                  describe('Failure' , () => {
                    
                     it('rejects invalid order ids' , async () => {
                        const invalidOrderId = 99999
                        await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
                     })

                     it('rejects already filled orders' , async () => {
                         transaction = await exchange.connect(user2).fillOrder(1)
                         await transaction.wait()

                         await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                     })

                     it('rejects cancelled orders' , async () => {
          
                        transaction = await exchange.connect(user1).cancelOrder(1)
                        await transaction.wait()

                        await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                    })
                  })
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

