import React, { useEffect, useState } from "react";
import { Contract, Account, Header, Footer, KudoBalance } from "../components";
import { Web3Consumer } from "../helpers/Web3Context";
import { useContractLoader } from "eth-hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { userMap } from "../helpers/FakeUsers";
import {Progress, Typography, Divider, Descriptions, Card, Form, Statistic, Input, InputNumber, Button} from 'antd';
const {Title, Text } = Typography;

async function claim(web3, contracts, taskId) {
  let boardContract=contracts["KudosVolunteerBoard"].connect(web3.userSigner);
  await boardContract.claimTaskReward(taskId)
}

function Home({ web3 }) {
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  let router = useRouter();
  let taskId = router.query.taskId;

  console.log("taskId", router.query)
  console.log("taskId", taskId)

  // if(!taskId){
  //   router.push("/");
  // }

  let  claimTask= async ()=>{
    await claim(web3, contracts, taskId);
    router.push("/");
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
        <Card>
          <Title>Thankyou for your hard work!</Title>
        </Card>
      </div>
    </>
  );
}

export default Web3Consumer(Home);
