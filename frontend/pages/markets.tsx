import MarketplaceRowItem from "components/marketplace/MarketplaceRowItem";
import Heading from "components/ui/Heading";
import useBorrowContract from "lib/hooks/useBorrowContract";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { LoopingRhombusesSpinner } from "react-epic-spinners";

type Props = {};

type MarketplaceItem = {
  borrower: string;
  revenue: string;
  loanRequested: string;
  loanFilled: string;
  lendApr: string;
  status: string;
};

const MarketsPage: NextPage = (props: Props) => {
  const [loans,setLoans] = useState<any>([]);
  const [loading,setLoading] = useState<boolean>(false);
  const marketplaceItems = [{}, {}, {}, {}, {}];
  const {getAllBorrowers } = useBorrowContract();

  useEffect(()=>{
    ( async ()=> {
      setLoading(true)
      const data = await getAllBorrowers()
      setLoans(data);
      setLoading(false)
    })()
  },[])

  if (loading)
  return (
    <div className="flex flex-col space-y-8 items-center justify-center py-28">
      <LoopingRhombusesSpinner color="rgb(59,130,240)" />
      <div>
      Loading Marketplace ... 
      </div>
    </div>
  );

  return (
    <div>
      <Heading className="mb-8">Explore Marketplace</Heading>
      <table className="w-full text-left text-gray-800 ">
        <thead className="text-xs border-y text-gray-700 uppercase bg-gray-50 ">
          <tr>
            <th scope="col" className="py-3 px-6">
              Borrower
            </th>
            <th scope="col" className="py-3 px-6">
              Revenue
            </th>
            <th scope="col" className="py-3 px-6">
              Loan Requested
            </th>
            <th scope="col" className="py-3 px-6">
              Loan Filled ( % )
            </th>
            <th scope="col" className="py-3 px-6">
              Interest Rate
            </th>
            <th scope="col" className="py-3 px-6">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {loans.map((item:any, index:number) => (

            <MarketplaceRowItem key={index} data={item}/>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketsPage;
