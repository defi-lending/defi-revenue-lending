import { Tab } from "@headlessui/react";
import BorrowDashboard from "components/dashboard/BorrowDashboard";
import LendDashboard from "components/dashboard/LendDashboard";
import Heading from "components/ui/Heading";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import React from "react";
import { useSigner } from "wagmi";

type Props = { address: string };

const dashboard = ({ address }: Props) => {
  const { data: signer } = useSigner();
  if (!signer) {
    return (
      <div className="py-20 text-xl flex items-center justify-center">
        Please connect your wallet first
      </div>
    );
  }

  return (
    <div>
      <Heading className="mb-4">Dashboard</Heading>

      <BorrowDashboard />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({ req: context.req });
  const address = token?.sub ?? null;

  return {
    props: {
      address,
    },
  };
};

export default dashboard;
