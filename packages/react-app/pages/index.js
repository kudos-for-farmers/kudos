import React, { useContext, useState } from "react";
import { Contract, Account, Header, Footer } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";
import { useRouter } from "next/router";

import {Typography, Divider, Card, Form, Input, InputNumber, Button} from 'antd';
const {Title, Text } = Typography;

// async function submitProposal(web3, contract, functionName, values) {
//   let callData=encodeFunction(contract, functionName, values);
//   let hash="..";
//   let proposalData={
//     to: [
//       contract.address,
//     ],
//     data: [
//       callData,
//     ],
//     value: [
//       0,
//     ],
//     titleText: "my Proposal", //TODO lol
//     descriptionHash: "" // we are not using IPFS hashes yet
//   }
//   //for now just log it, later would submit directly to the guild contract
//   console.log(proposalData);

// }
// function encodeFunction(contract, fnName, values) {
//   // console.log(contract, fnName, values)
//   // let entries=Object.entries(contract.interface.functions);
//   // let [fnSignature, fnInterface]= entries.find((entry)=>{return entry[1].name == fnName});
//   // let fnSignatureEncoded = lib.eth.abi.encodeFunctionSignature(fnSignature);
//   // let parameters = contract.interface.function[functionName];
//   // let fnParametersEncoded = lib.eth.abi.encodeParameters(parameters, values).substring(2);

//   // return fnSignatureEncoded + fnParametersEncoded;
//   return contract.interface.encodeFunctionData(fnName, values);
// }

// function formatInputs(inputs){

// }

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

function useVoteOnProposal(web3, proposal) {
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  let signer = web3.userSigner;

  return async () => {
    let {id} = proposal
    console.log(`voting on proposal ${id}...`);
    let guildContract=contracts["KudosGuild"].connect(signer);
    let amount = await guildContract.votingPowerOf(signer.address);
    console.log(guildContract, guildContract.setVote, id, amount);
    await guildContract.setVote(id, amount);
    console.log(`voted on proposal ${id} with ${amount} voting power`);
  }
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

function useProposalForm() {
  let [state, setState] = useState({
    id: null,
    description: "Give some kudos!",
    recipient: null,
    amount: 0,
  });

  return [state, setState];
}

function Home({ web3 }) {
  console.log(`🗄 web3 context:`, web3);

  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  console.log('contracts:', contracts);

  // let lockTokens=useLockVotingTokens(web3);
  // let proposeKudoDistribution=useProposeKudoDistribution(web3, proposal, setProposal);
  // let voteOnProposal=useVoteOnProposal(web3, proposal);
  // let endProposal=useEndProposal(web3, proposal);

  let [proposalId, setProposalId] = useState("");
  let router = useRouter();
  let onFormSubmit = async (values) => {
    const userMap= {
      "bob@gmail.com": web3.userSigner.address,
    };
    let recipient = userMap[values.address];
    let description = values.description;
    let amount = parseInt(values.amount);
    console.log(web3, contracts, recipient, amount, description);
    let id = await proposeKudoDistribution(web3, contracts, recipient, amount, description)
    router.push({
      pathname: '/proposals',
      query: {pid: id}
    })
  }

  //console.log(`info:`, web3.localProvider, web3.selectedChainId, proposal);

  return (
    <>

      <div className="flex flex-1 justify-between items-center">
        <Header />
        <div className="mr-6">
          <span>hellloooo</span>
        </div>
      </div>

      {/* Main Page Content start */}
      <div className="flex flex-1 flex-col h-screen w-full items-center">
        <Title>Propose a Kudo reward</Title>
        <Card>
          <Form requiredMark='optional' onFinish={onFormSubmit}>
            <Form.Item
              label="Recipient email address"
              name="address"
              rules={[
                {required: true, message: "The recipient's email address is required"},
                {type: "email", message: "The recipient's email address does not look like a valid email address"},
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              label="The amount of Kudos to award"
              name="amount"
              rules={[
                {required: true, message: "The amount of kudos is required"},
                {type: "integer", message: "the amount of kudos must be a whole number"},
              ]}
            >
              <InputNumber min={0} max={100}/>
            </Form.Item>

            <Form.Item
              label="What are the Kudos for"
              name="description"
              rules={[
                {required: true, message: "The proposal description is required"}
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={ {margin: "0 auto"} }>Submit Proposal</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <Footer/>
    </>
  );
}

export default Web3Consumer(Home);
