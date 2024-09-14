import { useEffect } from "react";

function Home() {
    useEffect(() => {
      window.location.pathname = "/login"
    },[])
  return (
    <>
    </>
  );
}

export default Home;
