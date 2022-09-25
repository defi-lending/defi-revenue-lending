import Button from "components/ui/Button";
import React from "react";

type Props = {
  data: any;
  claimRepayment: any;
};

const RepayClaim = ({ data, claimRepayment }: Props) => {
  console.log(data);
  return (
    <div className="my-4 bg-white border rounded-lg p-8">
      <p className="text-lg font-medium mb-2">You are a lender ! </p>
      {data?.map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between flex-wrap p-2 border">
          <p className="">ID : {item.id} </p>
          <p className="">Accumulated Revenue : {item?.accRev} MATIC </p>
          {data?.accRev > 0 ? (
            <Button
              onClick={() => claimRepayment(data?.accRev, data?.id)}
              variant="success"
            >
              Claim
            </Button>
          ) : (
            <Button onClick={() => alert("Nothing to claim")}>
              Nothing to Claim
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RepayClaim;
