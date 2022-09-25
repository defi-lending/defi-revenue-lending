import React, { useState, useCallback, useEffect } from "react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Heading from "components/ui/Heading";
import Button from "components/ui/Button";
import { getSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectStripe from "components/borrow-flow/ConnectStripe";
import { SubmitHandler, useForm } from "react-hook-form";
import { BorrowLoanFormData, StripeReport } from "types";
import ShowRevenueReport from "components/borrow-flow/ShowRevenueReport";
import AddBorrowRequestDetails from "components/borrow-flow/AddBorrowDetails";
import AddCompanyDetails from "components/borrow-flow/AddCompanyDetails";
import useBorrowContract from "lib/hooks/useBorrowContract";
import { LoopingRhombusesSpinner } from "react-epic-spinners";
import { chain } from "wagmi";
import { ethers } from "ethers";
import { NFT_ABI } from "contracts/RevenueBasedLoanNft";
import {
  BORROW_CONTRACT_ABI,
  BORROW_CONTRACT_ADDRESS,
} from "contracts/borrowContracts";
import { useRouter } from "next/router";

type AuthenticatedPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export enum Steps {
  GET_STARTED,
  CONNECT_STRIPE,
  SHOW_REVENUE_REPORT,
  ADD_COMPANY_DETAILS,
  ADD_BORROW_DETAILS,
}

const BorrowPage: NextPage = ({ address }: AuthenticatedPageProps) => {
  // current step , defined in Steps enum
  const [step, setStep] = useState<Steps>(Steps.GET_STARTED);
  const [stripeReport, setStripeReport] = useState<StripeReport | null>(null);
  const { createBorrowRequest } = useBorrowContract();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
  } = useForm<BorrowLoanFormData>({
    mode: "onBlur",
    defaultValues: {
      name: "Example Name",
      description: "Super cool company ",
      email: "example@xyz.com",
      linkedIn: "https://linkedin.com/in/",
      twitter: "https://twitter.com/",
      website: "https://example.xyz",
    },
  });

  const { openConnectModal } = useConnectModal();

  if (!address && openConnectModal) {
    openConnectModal();
  }

  useEffect(() => {
    if (address) {
      (async () => {
        const provider = new ethers.providers.AlchemyProvider(
          chain.polygonMumbai.id,
          process.env.ALCHEMY_KEY
        );

        const borrowContract = new ethers.Contract(
          BORROW_CONTRACT_ADDRESS,
          BORROW_CONTRACT_ABI,
          provider
        );
        const res = await borrowContract.loanRequestAddresses(address);
        if(res!=ethers.constants.AddressZero){
          alert('you already have a borrow loan request active')
          router.push('/dashboard');
        }
      })();
    }
  }, []);

  const handleBorrowRequest: SubmitHandler<BorrowLoanFormData> = async (
    data
  ) => {
    setLoading(true);
    try {
      // generate metata
      const metadata = { ...data, stripeReport };
      console.log(metadata);
      await createBorrowRequest(metadata.amount, metadata);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const renderBorrowFlow = useCallback(() => {
    switch (step) {
      case Steps.GET_STARTED: {
        return (
          <div className="flex flex-col items-center justify-center ">
            <Heading>Ready to get started? </Heading>
            <p className=" max-w-2xl my-8 text-center">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
              provident similique vitae rem tenetur est facilis praesentium
              odit, deserunt blanditiis velit recusandae iste inventore optio?
              Dolores optio qui modi deleniti.
            </p>
            <Button
              onClick={() => setStep(Steps.CONNECT_STRIPE)}
              size="lg"
              variant="primary"
            >
              Let's Start
            </Button>
          </div>
        );
      }
      case Steps.CONNECT_STRIPE: {
        return (
          <ConnectStripe
            stripeKeyValue={watch("stripeKey")}
            register={register}
            setStep={setStep}
          />
        );
      }
      case Steps.SHOW_REVENUE_REPORT: {
        return (
          <ShowRevenueReport
            stripeKey={watch("stripeKey")}
            setStep={setStep}
            setReport={setStripeReport}
          />
        );
      }
      case Steps.ADD_COMPANY_DETAILS: {
        return (
          <AddCompanyDetails
            errors={errors}
            register={register}
            setStep={setStep}
          />
        );
      }
      case Steps.ADD_BORROW_DETAILS: {
        return (
          <AddBorrowRequestDetails
            watch={watch}
            register={register}
            setStep={setStep}
            report={stripeReport}
          />
        );
      }
      default:
        return <div>Seems like you are lost friend </div>;
    }
  }, [step]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <LoopingRhombusesSpinner color="rgb(59,130,240)" />
      </div>
    );
  return (
    <form onSubmit={handleSubmit(handleBorrowRequest)}>
      {renderBorrowFlow()}
    </form>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null;
  
  // if we have address value , server knows we are authenticated

  return {
    props: {
      address,
    },
  };
};

export default BorrowPage;
