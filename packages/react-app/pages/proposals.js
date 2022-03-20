import React, { useContext, useState } from "react";
import { Contract, Account, Header, Footer } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";
import { useRouter } from "next/router";

import {Typography, Divider, Card, Form, Input, InputNumber, Button} from 'antd';
const {Title, Text } = Typography;

function useLockVotingTokens(web3) {
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  let signer = web3.userSigner;

  return async () => {
    let guildContract=contracts["KudosGuild"].connect(signer);
    let votingTokenContract=contracts["GuildVotingToken"].connect(signer);

    let amount = await votingTokenContract.balanceOf(web3.address);
    let vaultAddress = await guildContract.tokenVault();
    await votingTokenContract.approve(vaultAddress, amount);
    await guildContract.lockTokens(amount);
    console.log(`locked ${amount} voting tokens with the guild.`);
  }
}

async function proposeKudoDistribution(web3, contracts, recipient, amount, description) {
  let signer = web3.userSigner;
    let guildContract=contracts["KudosGuild"].connect(signer);
    let kudosContract=contracts["KudosToken"];

    let data = kudosContract.interface.encodeFunctionData("mint", [recipient, amount]);
    let hash = kudosContract.interface.getSighash("mint");

    let contentHash = "0xFF";
    let tx = await guildContract.createProposal([kudosContract.address], [data], [0], description, contentHash);
    let receipt = await tx.wait();
    let event = receipt.events.find(event=>event.event==='ProposalCreated');
    const [id] = event.args;
    console.log(tx, event.args);
    console.log(`submit new proposal ${id} to distribute ${amount} kudos to ${recipient}: ${description}`);
    return id
}


function useEndProposal(web3, proposal) {
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  let signer = web3.userSigner;

  return async () => {
    let {id} = proposal
    let guildContract=contracts["KudosGuild"].connect(signer);
    await guildContract.endProposal(id);
    console.log(`completed proposal ${id}`);
  }
}

async function getAllProposals(web3, contracts) {
  let guildContract=contracts["KudosGuild"];
  const numberOfProposals = await guildContract.getProposalsIdsLength();
  console.log(`there are ${numberOfProposals} proposals`);
  const proposals=Array(numberOfProposals);
  if (numberOfProposals==0) {
    return  []
  } else {
    for (let i=0; i<numberOfProposals; i++) {
      const id=await guildContract.proposalsIds(i);
      proposals[i]=await getProposal(web3, contracts, id);
    }
    return proposals;
  }
}

async function getProposal(web3, contracts, id) {
  let guildContract=contracts["KudosGuild"];
  const proposal=await guildContract.proposals(id);
  return {
    id: id,
    proposal: proposal,
    votes: proposal.totalVotes,
    description: proposal[3],
    endTime: proposal.endTime,
  }
}

function useProposalForm() {
  let [state, setState] = useState({
    id: null,
    description: "Give some kudos!",
    recipient: null,
    amount: 0,
  });

  return [state, setState];
}


function Proposal({id, votes, description, endTime}, voteOnProposal) {
  console.log(voteOnProposal);
  return (
    <Card>
      <Title>reason: {description}</Title>
      <p>{"someone"} will recieve {"some amount of"} kudos</p>
      <p>three were {votes.toString()} votes for this proposal</p>
      <p>it will end at {endTime.toString()} time</p>
      <p>it is currently {new Date().getTime()/1000} time</p>
      <Button onClick={voteOnProposal(id)}>Vote</Button>
    </Card>
  );
}

function Home({ web3 }) {
  console.log(`🗄 web3 context:`, web3);
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  console.log('contracts:', contracts);

  let router = useRouter();
  let proposalId = router.query.pid;
  let [proposals, setProposals] = useState();

  console.log("proposals", proposals)
  if(contracts["KudosGuild"] && !proposals) {
    if(proposalId){
      getProposal(web3, contracts, proposalId)
        .then(proposal=>setProposals((state)=>{return [proposal]}))
    } else {
      getAllProposals(web3, contracts)
        .then(allProposals=>{console.log("proposals:", allProposals); return allProposals})
        .then(allProposals=>setProposals((state)=>{return allProposals}))
    }
  }
  proposals=proposals || [];

  let voteOnProposal=function(id){
    return async ()=>{
      let signer = web3.userSigner;
      console.log(`voting on proposal ${id}...`);
      let guildContract=contracts["KudosGuild"].connect(signer);
      let amount = await guildContract.votingPowerOf(signer.address);
      console.log(guildContract, guildContract.setVote, id, amount);
      await guildContract.setVote(id, amount);
      console.log(`voted on proposal ${id} with ${amount} voting power`);
      setProposals((state)=>{return null})
      router.replace({
        pathname: '/proposals',
        query: {pid: id}
      })
    }
  }

  console.log("proposals:", proposals)

  return (
    <>

      <div className="flex flex-1 justify-between items-center">
        <Header />
      </div>

      {/* Main Page Content start */}
      <div className="flex flex-1 flex-col h-screen w-full items-center">
        {proposalId?(<Title>Proposal</Title>):(<Title>All Proposals</Title>)}
        <Card>
          {
            proposals.map((p)=>{return Proposal(p, voteOnProposal)})
          }
        </Card>
      </div>
      <Footer/>
    </>
  );
}

export default Web3Consumer(Home);
