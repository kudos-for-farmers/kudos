import Link from "next/link";
import React, { useState } from "react";
import { useContractLoader } from "eth-hooks";
import { Web3Consumer } from "../helpers/Web3Context";
import { Avatar, Typography } from "antd";
import { UserOutlined } from '@ant-design/icons';


// displays a page footer

async function getKudoBalance(web3, contracts){
  if (web3 && contracts && contracts["KudosToken"]){
    let kudoContract=contracts["KudosToken"];
    let balance= await kudoContract.balanceOf(web3.userSigner.address);
    return balance.toString();
  } else {
    return "..."
  }
}
function KudoBalance({web3}) {
  let [balance, setBalance] = useState("...");
  let contracts = useContractLoader(web3.localProvider, web3.contractConfig);
  getKudoBalance(web3, contracts).then((balance)=>{setBalance(balance)})

  return (
    <div style={ {padding: "10px"} }>
      <Avatar size="large" icon={<UserOutlined/>} />
      <br/>
      <Typography.Text strong>{balance} kudos</Typography.Text>
    </div>
  );
}

export default Web3Consumer(KudoBalance);
