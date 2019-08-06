// const MetaCoin = artifacts.require("MetaCoin");
const ballot = artifacts.require("ballot");

contract("ballot", async accounts => {
  let ballotInstance;
  beforeEach(async () => {
    let bribeAmount;
    ballotInstance = await ballot.deployed();
    await ballotInstance.giveRightToVote(accounts[0]);
    await ballotInstance.giveRightToVote(accounts[1]);
    await ballotInstance.giveRightToVote(accounts[2]);
    await ballotInstance.giveRightToVote(accounts[3]);
  });
  it("should deploy contract and give voting rigts to at lest 2 addresses", async () => {
    const rightCheck = await ballotInstance.haveRightToVote.call(accounts[0]);
    const rightCheck2 = await ballotInstance.haveRightToVote.call(accounts[2]);
    assert.ok(rightCheck);
    assert.ok(rightCheck2);
  });

  it("vote was stored", async () => {
    const proposal = 4;
    const vote = await ballotInstance.vote(proposal, { from: accounts[1] });
    const check = await ballotInstance.votedFor.call(accounts[1]);
    assert.equal(proposal, check);
  });

  it("bribe one of the account and check", async () => {
    bribeAmount = 10000000;
    const proposalA = 2;
    console.log(await web3.eth.getBalance(accounts[0]));
    let bribe = await ballotInstance.bribe(accounts[2], proposalA, {
      from: accounts[0],
      value: bribeAmount
    });
    console.log(await web3.eth.getBalance(accounts[0]));
    let check = await ballotInstance.getBribeInfo.call(accounts[2]);
    assert(false);
    assert.equal(check._amount, bribeAmount);
    assert.equal(check._vote, proposalA);
  });

  it("two counter votes. transfer funds for bribed vote. correctly decided on winning proposal", async () => {
    const proposalA = 2;
    let initBalance = await web3.eth.getBalance(accounts[2]);
    console.log(initBalance);
    const vote = await ballotInstance.vote(proposalA, { from: accounts[0] });
    const vote2 = await ballotInstance.vote(proposalA, { from: accounts[2] });
    const result = await ballotInstance.winningProposal.call();
    // let diffrerence = afterVoteBalance - initBalance;
    // assert.equal(diffrerence, bribeAmount);
    let afterVoteBalance = await web3.eth.getBalance(accounts[2]);
    console.log(afterVoteBalance);
    assert(false);
    assert.equal(proposalA, result);
  });
});
