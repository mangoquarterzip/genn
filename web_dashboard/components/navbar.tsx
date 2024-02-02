import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-lg rounded-b-xl">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">GENN</a>
      </div>
      <div className="flex-none">
        <ConnectButton />
      </div>
    </div>
  );
};
