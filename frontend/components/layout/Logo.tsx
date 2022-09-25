import Link from "next/link";
import React from "react";
import { AiOutlineBank } from "react-icons/ai";
type Props = {};

const Logo = (props: Props) => {
  return (
    <Link href="/">
      <div className="flex items-center  cursor-pointer group gap-2 group">
        {/* <AiOutlineBank className="h-8 w-8 text-brand-500 group-hover:scale-125  duration-300 ease-out group-hover:-rotate-12" /> */}
        <h1 className="text-2xl  text-blue-500 px-2 py-1 font-bold  font-sora">
          RevFi
        </h1>
      </div>
    </Link>
  );
};

export default Logo;
