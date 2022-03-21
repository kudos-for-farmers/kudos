import React, { useContext, useState } from "react";
import { Contract, Account, Header, Footer, KudoBalance } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { userMap } from "../helpers/FakeUsers";

import {Typography, Divider, Card, Form, Input, InputNumber, Button} from 'antd';
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

async function proposeKudoClaim(web3, contracts, {duration, amount, name, description, maxClaims}) {
  let signer = web3.userSigner;
    let guildContract=contracts["KudosGuild"].connect(signer);
    let boardContract=contracts["KudosVolunteerBoard"];

    let contentHash = "0xFF";
    let durationInSeconds=duration*86400
  console.log("form data:", durationInSeconds, amount, name, description, maxClaims);
    let data = boardContract.interface.encodeFunctionData("createTaskNow", [signer.address, durationInSeconds, amount, name, description, maxClaims, contentHash]);
    let hash = boardContract.interface.getSighash("createTaskNow");

    let tx = await guildContract.createProposal([boardContract.address], [data], [0], description, contentHash);
    let receipt = await tx.wait();
    let event = receipt.events.find(event=>event.event==='ProposalCreated');
    const [id] = event.args;
    console.log(tx, event.args);
    console.log(`submit new proposal ${id} to distribute ${amount} kudos for ${description}`);
    return id
}

function Home({ web3 }) {
  console.log(`🗄 web3 context:`, web3);

  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  console.log('contracts:', contracts);

  if(contracts["KudosGuild"]){
    lockAllVotingTokens(web3, contracts); //TODO should do this everywhere, anytime, all the time. but really only on first page load.
  }

  let [proposalId, setProposalId] = useState("");
  let router = useRouter();

  let onFormSubmit = async (values) => {
    let recipient = userMap(web3.userSigner.address)[values.address];
    let description = values.description;
    let amount = parseInt(values.amount);
    console.log(web3, contracts, recipient, amount, description);
    let id = await proposeKudoClaim(web3, contracts, values);
    router.push({
      pathname: '/proposals',
      query: {pid: id}
    })
  }

  return (
    <>

      <div className="flex flex-1 justify-between items-center">
        <Header />
        <KudoBalance />
      </div>
      <Footer/>

      {/* Main Page Content start */}
      <div className="flex flex-1 flex-col h-screen w-full items-center">
        <Title>Propose a future Kudo claim</Title>
        <Card>
          <Form requiredMark='optional' onFinish={onFormSubmit}>
            <Form.Item
              label="What is the name of this task"
              name="name"
              rules={[
                {required: true, message: "The proposal description is required"}
              ]}
            >
              <Input/>
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
              label="Max times it can be claimed"
              name="maxClaims"
              rules={[
                {required: true, message: "The amount of claims is required"},
                {type: "integer", message: "the amount of claims must be a whole number"},
              ]}
            >
              <InputNumber min={0}/>
            </Form.Item>

            <Form.Item
              label="Claim time (days)"
              name="duration"
              rules={[
                {required: true, message: "The claim duration is required"},
                {type: "integer", message: "the claim duration must be a whole number"},
              ]}
            >
              <InputNumber min={0} max={360}/>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={ {margin: "0 auto"} }>Submit Proposal</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default Web3Consumer(Home);
