import Link from "next/link";
import React from "react";
import { BorrowLoanFormData, StripeReport } from "types";

type Props = {
  data: BorrowLoanFormData & {
    stripeReport: StripeReport;
    loanAddress: string;
    loanFilled: number;
  };
};

const MarketplaceRowItem = ({ data }: Props) => {
  console.log(data);
  return (
    <Link href={`/loans/${data?.loanAddress}`}>
      <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
        <th
          scope="row"
          className="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap"
        >
          <div className="pl-3">{data?.name}</div>
        </th>
        <td className="py-4 px-6 text-center whitespace-pre-wrap">
          {Number(data?.stripeReport?.activity).toFixed(2)}{" "}
          {data?.stripeReport?.currency.toUpperCase()}
        </td>
        <td className="py-4 px-6 text-center">{data?.amount} MATIC</td>
        <td className="py-4 px-6 text-center">
          {(data?.loanFilled / data?.amount) * 100}%
        </td>
        <td className="py-4 px-6 text-right">10%</td>
      </tr>
    </Link>
  );
};

export default MarketplaceRowItem;
