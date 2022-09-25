import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import React from "react";

type Props = {};

const dashboard = (props: Props) => {
  return <div>dashboard</div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({ req: context.req });
  const address = token?.sub ?? null;

  
  
  return {
    props: {},
  };
};

export default dashboard;
