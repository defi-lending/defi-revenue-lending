import Link from "next/link";
import React from "react";

type Props = {
  data:any
};

const MarketplaceRowItem = (props: Props) => {
  return (
    <Link href={`/loans/${props.data}`}>
      <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
        <th
          scope="row"
          className="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap"
        >
          <img
            className="w-10 h-10 rounded-full object-cover object-center"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80"
            alt="Jese image"
          />
          <div className="pl-3">Company Name</div>
        </th>
        <td className="py-4 px-6 ">$100k / month</td>
        <td className="py-4 px-6">$50,000</td>
        <td className="py-4 px-6">50%</td>
        <td className="py-4 px-6">10% - 12%</td>
        <td className="py-4 px-6">
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2" />{" "}
            Active
          </div>
        </td>
      </tr>
    </Link>
  );
};

export default MarketplaceRowItem;
