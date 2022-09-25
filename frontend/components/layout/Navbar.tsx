import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { useSigner } from "wagmi";
import Logo from "./Logo";

type Props = {};

const Navlink = (props: { children: React.ReactNode ,link:string}) => {
  const router = useRouter();

  const isCurrentPath = router.asPath === props.link;

  return (
      <a
        href={props.link}
        className={`font-medium duration-300 ease-out py-2 px-3  hover:text-black  rounded-lg ${
          isCurrentPath ? " bg-gray-200 text-black" : " text-gray-500"
        }`}
      >
        {" "}
        {props.children}
      </a>
  );
};
const Navbar = (props: Props) => {
  const {data:signer} = useSigner();
  return (
    <header className="px-8 py-4 sticky backdrop-blur-xl border-b border-gray-300">
      <nav className="flex max-w-screen-xl mx-auto justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <Navlink link="/markets">Marketplace</Navlink>
          {signer && <Navlink link="/borrow">Borrow</Navlink>}
          {signer && <Navlink link="/dashboard">Dashboard</Navlink>}
        </div>
        {/* <Button loading variant="primary">Connect Wallet</Button> */}
        <ConnectButton />
      </nav>
    </header>
  );
};

export default Navbar;
