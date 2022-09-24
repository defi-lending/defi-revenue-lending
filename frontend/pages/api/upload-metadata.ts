import { storeToIpfs } from "lib/nftStorage";
import { NextApiRequest, NextApiResponse } from "next";
import { Blob } from "nft.storage";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    const {metadata} = req.body;
    const metadataBlob = new Blob([JSON.stringify(metadata)]);
    const cid = await storeToIpfs(metadataBlob);
    res.json({uri:"ipfs://" + cid})
  }catch(err){
    console.log(err);
    res.status(500).json({err})
  }
}