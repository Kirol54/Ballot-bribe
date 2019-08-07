pragma solidity >=0.4.22 <0.6.0;
contract Ballot {

    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
    }
    struct Proposal {
        uint voteCount;
    }

    struct Bribe {
        uint amount;
        uint8 vote;
    }

    address chairperson;
    mapping(address => Voter) voters;
    mapping(address => Bribe) public theBribe;
    mapping (address => uint) pendingWithdraw;
    Proposal[] proposals;

    /// Create a new ballot with $(_numProposals) different proposals.
    constructor(uint8 _numProposals) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        proposals.length = _numProposals;
    }

    /// Give $(toVoter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
    function giveRightToVote(address toVoter) public {
        if (msg.sender != chairperson || voters[toVoter].voted) return;
        voters[toVoter].weight = 1;
        emit rightGiven(toVoter, voters[toVoter].weight);
    }
    // testing function
    function haveRightToVote(address voter) public view returns (bool){
        if(voters[voter].weight >= 1) return true;
    }

    /// Delegate your vote to the voter $(to).
    /* solium-disable-next-line */
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender]; // assigns reference
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegateTo = voters[to];
        if (delegateTo.voted)
            proposals[delegateTo.vote].voteCount += sender.weight;
        else
            delegateTo.weight += sender.weight;
    }

    /// Give a single vote to proposal $(toProposal).
    function vote(uint8 toProposal) public {
        require(voters[msg.sender].voted == false, "Already votted");
        require(voters[msg.sender].weight >= 1, "No rights to vote");
        Voter storage sender = voters[msg.sender];
        if (sender.voted || toProposal >= proposals.length) return;
        sender.voted = true;
        sender.vote = toProposal;
        proposals[toProposal].voteCount += sender.weight;
        emit addressVoted(msg.sender, toProposal, false);
        if(sender.vote == theBribe[msg.sender].vote){
        uint amount = pendingWithdraw[msg.sender];
        pendingWithdraw[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit addressVoted(msg.sender, toProposal, true);
        }
    }
    // testitng funtion
    function votedFor(address voter) public view returns(uint8 proposal){
        require(voters[voter].voted == true, "Address didn't vote");
        return voters[voter].vote;
    }

    function winningProposal() public view returns (uint8 _winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++)
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                _winningProposal = prop;
            }
    }
    function bribe(address _reciver, uint8 _vote) public payable {
        require(_vote <= proposals.length, "Not valid vote option");
        require(!voters[_reciver].voted, "Reciver already voted");
        require(voters[_reciver].weight >= 1, "Reciver have no power to vote");
        require(theBribe[_reciver].amount <= msg.value, "reciver was bribed with more eth already");
        if(theBribe[_reciver].vote == _vote){
            theBribe[_reciver].amount += msg.value;
            pendingWithdraw[_reciver] += msg.value;
            emit brodcastBribe(_reciver, _vote, msg.value, pendingWithdraw[_reciver]);
        }
        theBribe[_reciver].amount = msg.value;
        theBribe[_reciver].vote = _vote;
        pendingWithdraw[_reciver] = msg.value;
        emit brodcastBribe(_reciver, _vote, msg.value, pendingWithdraw[_reciver]);
    }
    // testitng funtion
    function getBribeInfo(address _reciver) public view returns (uint _amount, uint8 _vote ){
        return (theBribe[_reciver].amount, theBribe[_reciver].vote);
    }
    event brodcastBribe(address _reciver, uint8 _vote, uint _amount, uint pendingWithdraw);
    event rightGiven(address _reciver, uint _weight);
    event addressVoted(address _voter, uint8 proposal, bool wasBribed);
}
