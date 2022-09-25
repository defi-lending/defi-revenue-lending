import axios from "axios";
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
  const [loans, setLoans] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { borrowContract } = useBorrowContract();
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filter = borrowContract.filters.LoanRequestCreation(
          null,
          null,
          null
        );
        // const loanRequests = await Promise.all(promises)
        const query = await borrowContract.queryFilter(filter);
        let _loans = await query.map(async (item) => {
          if (item.args) {
            const metadataUri = item?.args[2];
            const loanAddress = item?.args[1];
            const { data } = await axios.get(
              metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
            );
            return {...data,loanAddress}
          }
        });
        _loans = await Promise.all(_loans);
        setLoans(_loans)
      } catch (err) {
        console.error(err);
      }
      console.log(loans);
      setLoading(false);
    })();
  }, [borrowContract]);

  if (loading)
    return (
      <div className="flex flex-col space-y-8 items-center justify-center py-28">
        <LoopingRhombusesSpinner color="rgb(59,130,240)" />
        <div>Loading Marketplace ...</div>
      </div>
    );

  return (
    <div>
      <Heading className="mb-8">Explore Marketplace</Heading>
      <table className="w-full text-left text-gray-800 ">
        <thead className="text-xs border-y text-gray-700 uppercase bg-gray-50 ">
          <tr>
            <th scope="col" className="py-3 px-6 text-left">
              Borrower
            </th>
            <th scope="col" className="py-3 px-6 text-center">
              Revenue
            </th>
            <th scope="col" className="py-3 px-6 text-center">
              Loan Requested
            </th>

            <th scope="col" className="py-3 px-6 text-right">
              Interest Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {loans?.map((item: any, index: number) => (
            <MarketplaceRowItem key={index} data={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketsPage;
