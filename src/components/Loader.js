import React from "react";
import { DotSpinner } from "@uiball/loaders";

const Loader = () => {
  return (
    <div className="loader">
      <DotSpinner size={40} speed={0.9} color="white" />
    </div>
  );
};

export default Loader;
