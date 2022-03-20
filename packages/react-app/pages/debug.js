import React, { useContext, useState } from "react";
import { Contract, Account, Header } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";



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

function useProposeKudoDistribution(web3, proposal, setProposal) {
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  let signer = web3.userSigner;

  return async () => {
    let {recipient, amount, description} = proposal;
    console.log(proposal, recipient);
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
    setProposal( (proposal) => {
      return {...proposal, id: id}
    });
    console.log(`submit new proposal ${id} to distribute ${amount} kudos to ${recipient}: ${description}`);
  }
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

  let [proposal, setProposal]=useProposalForm();
  let lockTokens=useLockVotingTokens(web3);
  let proposeKudoDistribution=useProposeKudoDistribution(web3, proposal, setProposal);
  let voteOnProposal=useVoteOnProposal(web3, proposal);
  let endProposal=useEndProposal(web3, proposal);

  // default hardcode yourself as a recipient with 10 tokens. this would be populated by the form... and validated...
  if (!proposal.recipient && web3.userSigner) {
    setProposal((proposal)=>{
      return {...proposal, recipient: web3.userSigner.address, amount: 10}
    });
  }

  console.log(`info:`, web3.localProvider, web3.selectedChainId, proposal);

  return (
    <>
      {/* Page Header start */}
      <div className="flex flex-1 justify-between items-center">
        <Header />
        <div className="mr-6">
          <Account {...web3} />
        </div>
      </div>
      {/* Page Header start */}
      <div className="flex flex-1 flex-col w-full items-center">
        <div className="text-center" style={{ margin: 64 }}>
          <Link href="/kudos">kudos</Link> |
           | <Link href="/">proposals</Link> |
           | <Link href="/debug">developer screen</Link>
        </div>
      </div>
      {/* Main Page Content start */}

      <div className="flex flex-1 flex-col h-screen w-full items-center">
        <div className="text-center" style={{ margin: 64 }}>
          <span>This App is powered by Scaffold-eth & Next.js!</span>
          <br />
          <span>
            Added{" "}
            <a href="https://tailwindcomponents.com/cheatsheet/" target="_blank" rel="noreferrer">
              TailwindCSS
            </a>{" "}
            for easier styling.
          </span>
        </div>
        <div className="text-center">
          <div onClick={lockTokens}>
            Lock All Voting Tokens
          </div>
          <br/>
          <div onClick={proposeKudoDistribution}>
            Propose Kudo Distribution
          </div>
          <br/>
          <div onClick={voteOnProposal}>
            Vote For Proposal
          </div>
          <br/>
          <div onClick={endProposal}>
            End
          </div>

          <Contract
            name="GuildVotingToken"
            signer={web3.userSigner}
            provider={web3.localProvider}
            address={web3.address}
            blockExplorer={web3.blockExplorer}
            contractConfig={web3.contractConfig}
          />
          <Contract
            name="KudosGuild"
            signer={web3.userSigner}
            provider={web3.localProvider}
            address={web3.address}
            blockExplorer={web3.blockExplorer}
            contractConfig={web3.contractConfig}
          />
          <Contract
            name="KudosToken"
            signer={web3.userSigner}
            provider={web3.localProvider}
            address={web3.address}
            blockExplorer={web3.blockExplorer}
            contractConfig={web3.contractConfig}
          />
          <Contract
            name="AllocationToken"
            signer={web3.userSigner}
            provider={web3.localProvider}
            address={web3.address}
            blockExplorer={web3.blockExplorer}
            contractConfig={web3.contractConfig}
          />
        </div>
      </div>
    </>
  );
}

export default Web3Consumer(Home);
