// const MetaCoin = artifacts.require("MetaCoin");
const ballot = artifacts.require("ballot");

contract("ballot", async accounts => {
  let ballotInstance;
  beforeEach(async () => {
    let bribeAmountA;
    let bribeAmountB;
    ballotInstance = await ballot.deployed();
    await ballotInstance.giveRightToVote(accounts[0]);
    await ballotInstance.giveRightToVote(accounts[1]);
    await ballotInstance.giveRightToVote(accounts[2]);
    await ballotInstance.giveRightToVote(accounts[3]);
    await ballotInstance.giveRightToVote(accounts[4]); // loads of transaction - to be optimized
  });
  it("should deploy contract and give voting rigts to at lest 2 addresses", async () => {
    const rightCheck = await ballotInstance.haveRightToVote.call(accounts[0]);
    const rightCheck2 = await ballotInstance.haveRightToVote.call(accounts[2]);
    assert.ok(rightCheck);
    assert.ok(rightCheck2);
  });

  it("should store a vote", async () => {
    const proposalB = 4;
    const vote = await ballotInstance.vote(proposalB, { from: accounts[1] });
    const check = await ballotInstance.votedFor.call(accounts[1]);
    assert.equal(proposalB, check);
  });

  it("should bribe one of the account twice and check if registered", async () => {
    bribeAmountA = 25000000000000000000; // 25 eth
    bribeAmountB = 25000000000000000000; // 25 eth
    const proposalA = 2;
    let bribeA = await ballotInstance.bribe(accounts[2], proposalA, {
      from: accounts[0],
      value: bribeAmountA
    });
    let bribeB = await ballotInstance.bribe(accounts[2], proposalA, {
      from: accounts[4],
      value: bribeAmountB
    });
    let check = await ballotInstance.getBribeInfo.call(accounts[2]);
    assert.equal(check._amount, bribeAmountA + bribeAmountB);
    assert.equal(check._vote, proposalA);
  });

  it("two counter votes. transfer funds for bribed vote. correctly decided on winning proposal", async () => {
    const proposalA = 2;
    let initBalance = await web3.eth.getBalance(accounts[2]);
    const vote = await ballotInstance.vote(proposalA, { from: accounts[0] });
    const vote2 = await ballotInstance.vote(proposalA, { from: accounts[2] });
    const result = await ballotInstance.winningProposal.call();
    let afterVoteBalance = await web3.eth.getBalance(accounts[2]);
    let diffrerence = afterVoteBalance - initBalance;
    assert(diffrerence > web3.utils.toWei("49.99", "ether")); // based on bribe amount 50eth (-gas) NOT IDEAL
    assert.equal(proposalA, result);
  });
});
