import React, { useEffect, useState } from "react";
import { Contract, Account, Header, Footer, KudoBalance } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { userMap } from "../helpers/FakeUsers";
import {Progress, Typography, Divider, Descriptions, Card, Form, Statistic, Input, InputNumber, Button} from 'antd';
const {Title, Text } = Typography;

async function lockAllVotingTokens(web3, contracts) {
  let signer = web3.userSigner;
  let guildContract=contracts["KudosGuild"].connect(signer);
  let votingTokenContract=contracts["GuildVotingToken"].connect(signer);

  let amount = await votingTokenContract.balanceOf(web3.address);
  if (amount>0){
    let vaultAddress = await guildContract.tokenVault();
    await votingTokenContract.approve(vaultAddress, amount);
    await guildContract.lockTokens(amount);
    console.log(`locked ${amount} voting tokens with the guild.`);
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
  let kudosContract=contracts["KudosToken"];
  let boardContract=contracts["KudosVolunteerBoard"];

  const proposal=await guildContract.getProposal(id);
  console.log("fetched proposal:", proposal);
  let contractAddress=proposal.to[0];
  if (contractAddress == boardContract.address) {
    let data=proposal.data[0];
    let [ proposer, duration, amount, name, description, maxClaims, contentHash ] =boardContract.interface.decodeFunctionData("createTaskNow", data);
    let sigHash = boardContract.interface.getSighash("createTaskNow");
    console.log("decoded", proposer, duration, amount, name, description, maxClaims, contentHash);
    console.log("sighash", sigHash);

    return {
      amount: amount,
      duration: duration,
      maxClaims: maxClaims,
      id: id,
      proposal: proposal,
      votes: proposal.totalVotes,
      name: name,
      description: proposal.description,
      endTime: proposal.endTime,
      snapshotId: proposal.snapshotId,
    }
  } else if (contractAddress == kudosContract.address) {
    let data=proposal.data[0];
    let { to, amount }=kudosContract.interface.decodeFunctionData("mint", data);
    let [email, address] = Object.entries(userMap(web3.userSigner.address))
        .find((([key, value])=>value==to))

    return {
      recipient: email,
      amount: amount,
      id: id,
      proposal: proposal,
      votes: proposal.totalVotes,
      description: proposal.description,
      endTime: proposal.endTime,
      snapshotId: proposal.snapshotId,
    }
  } else {
    return {
      recipient: "unknown",
      amount: "unknown",
      id: id,
      proposal: proposal,
      votes: proposal.totalVotes,
      description: proposal.description,
      endTime: proposal.endTime,
      snapshotId: proposal.snapshotId,
    }
  }
}

function activeProposal(proposal){
  let state=proposal.proposal.state;
  return state === 1 || state === 0;
}


function Proposal({id, snapshotId, recipient, amount, votes, description, endTime}, voteOnProposal, endProposal) {
  let neededVotes=1; //TODO get this from the contract...
  let percent = (votes/neededVotes) * 100;
  let type=votes>=neededVotes? "success" : "";
  return (
    <Card>
      <Text strong>Awarded for:  </Text><Text>{description}</Text> <br/>
      {recipient &&<span><Text strong>Recipient:  </Text><Text>{recipient}</Text><br/></span>}
      <Text strong>Amount:  </Text><Text>{amount.toString()} Kudos</Text> <br/>
      <br/>
      {/*
      <Descriptions.Item label="Kudos">{amount}</Descriptions.Item>
      <Descriptions.Item label="Votes">{votes.toString()}</Descriptions.Item>
        */}
      <Statistic.Countdown title="voting time remaining" value={endTime*1000}/>
      <Progress percent={percent} showInfo={false}/>
      <Text strong type={type}>{`${votes}/${neededVotes} votes`}</Text>
      <br/>

      <Button onClick={voteOnProposal({id, snapshotId})}>Vote</Button>
      <Button onClick={endProposal(id)}>End</Button>
    </Card>
  );
}

function Home({ web3 }) {
  console.log(`🗄 web3 context:`, web3);
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  console.log('contracts:', contracts);

  if(contracts["KudosGuild"]){
    lockAllVotingTokens(web3, contracts); //TODO should do this everywhere, anytime, all the time. but really only on first page load.
  }

  let [proposals, setProposals] = useState();
  let router = useRouter();
  // useEffect(()=>{
  //   const handleStart=(url)=>{
  //     console.log("route start")
  //     setProposals(null);
  //   }
  //   router.events.on('routeChangeStart', handleStart)
  //   return ()=>{
  //     router.events.off('routeChangeStart', handleStart)
  //   }
  // }, [router]);
  let proposalId = router.query.pid;

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

  let voteOnProposal=function({id, snapshotId}){
    return async ()=>{
      let signer = web3.userSigner;
      let guildContract=contracts["KudosGuild"].connect(signer);
      let amount = await guildContract.votingPowerOfAt(signer.address, snapshotId);
      console.log(`voting on proposal ${id} with ${amount} voting power...`);
      console.log(guildContract, guildContract.setVote, id, amount);
      await guildContract.setVote(id, amount);
      console.log(`voted on proposal ${id} with ${amount} voting power`);
      setProposals((state)=>{return null})
    }
  }

  let endProposal=function(id){
    return async ()=>{
      let signer = web3.userSigner;
      let guildContract=contracts["KudosGuild"].connect(signer);
      await guildContract.endProposal(id);
      console.log(`completed proposal ${id}`);
    }
  }

  return (
    <>

      <div className="flex flex-1 justify-between items-center">
        <Header />
        <KudoBalance />
      </div>
      <Footer/>

      {/* Main Page Content start */}
      <div className="flex flex-1 flex-col w-full items-center">
        {proposalId?(<Title>Proposal</Title>):(<Title>All Proposals</Title>)}
        <Card>
          {
            proposals.filter(activeProposal).map((p)=>{return Proposal(p, voteOnProposal, endProposal)})
          }
        </Card>
      </div>
    </>
  );
}

export default Web3Consumer(Home);
