import axios from "axios";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { StripeReport } from "types";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import Heading from "components/ui/Heading";
import Button from "components/ui/Button";
import { Steps } from "pages/borrow";

type Props = {
  stripeKey: string;
  setStep: Dispatch<SetStateAction<Steps>>;
  setReport: Dispatch<SetStateAction<StripeReport |null>>;
};

const ShowRevenueReport = ({ stripeKey, setStep, setReport }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, _setReport] = useState<StripeReport>({} as StripeReport);

  const getRevenueReport = async () => {
    setLoading(true);
    try {
      console.log(stripeKey);
      const _report = await axios
        .post("/api/get-stripe-report/", { stripeKey })
        .then((res) => res.data);
      console.log({ _report });
      setReport(_report);
      _setReport(_report);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => await getRevenueReport())();
  }, []);

  const startIntervalDate = report && new Date(report?.interval_start * 1000);
  const endIntervalDate = report && new Date(report?.interval_end * 1000);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-28">
        <LoopingRhombusesSpinner color="rgb(59,130,240)" />
        Generating Revenue report ... 
      </div>
    );

  return (
    <div className="flex flex-col  items-center justify-center ">
      {report !== ({} as StripeReport) && (
        <div>
          <Heading className="mb-8">Stripe Revenue Reports</Heading>
          <table className="rounded-xl overflow-hidden ring-1 shadow-lg ring-gray-300">
            <tbody>
              <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
                <th
                  scope="row"
                  className="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap"
                >
                  Interval
                </th>
                <td className="py-4 px-6 ">{`${startIntervalDate?.toLocaleDateString()} - ${endIntervalDate?.toLocaleDateString()}`}</td>
              </tr>
              <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
                <th
                  scope="row"
                  className="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap"
                >
                  Gross Revenue
                </th>
                <td className="py-4 px-6 ">
                  {report?.activity_gross} {report?.currency?.toUpperCase()}
                </td>
              </tr>
              <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
                <th
                  scope="row"
                  className="flex items-center py-4 px-6 text-gray-900 whitespace-nowrap"
                >
                  Fees Paid
                </th>
                <td className="py-4 px-6 ">
                  {report?.activity_fee?.toFixed(2)}
                  {report?.currency?.toUpperCase()}
                </td>
              </tr>
              <tr className="bg-white border-b cursor-pointer hover:bg-gray-50 ">
                <th
                  scope="row"
                  className="text-green-500 flex items-center py-4 px-6  whitespace-nowrap"
                >
                  Net Revenue
                </th>
                <td className="py-4 px-6 font-medium text-green-500">
                  {report?.activity?.toFixed(2)}
                  {report?.currency?.toUpperCase()}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              onClick={() => setStep(Steps.CONNECT_STRIPE)}
              size="lg"
              className="mt-8"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(Steps.ADD_COMPANY_DETAILS)}
              variant="primary"
              size="lg"
              className="mt-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowRevenueReport;
