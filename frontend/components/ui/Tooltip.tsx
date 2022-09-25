import Tippy, { TippyProps } from "@tippyjs/react";
import React, { JSXElementConstructor, ReactElement, ReactNode } from "react";
import "tippy.js/animations/scale.css";
import 'tippy.js/dist/tippy.css'; 

type Props = {
  className?: string;
  content: ReactNode | string;
  children: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
} & TippyProps;

const Tooltip = ({ content, children, className = "", ...rest }: Props) => {
  return (
    <Tippy
      placement="bottom"
      animation="scale"
      arrow={true}
      className={
        className
      }
      {...rest}
      content={content}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
