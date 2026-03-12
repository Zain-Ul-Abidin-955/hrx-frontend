import Image from "next/image";
import { HrAuth } from "@/assets/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row max-w-[2000px] mx-auto">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center h-auto w-auto">
        {children}
      </div>

      {/* Right Section */}
      <div className="hidden md:flex flex-1 bg-bgColor items-center justify-center h-auto w-auto">
        <Image
          src={HrAuth}
          alt="Login Image"
          className="object-fit"
          // height={290}
          // width={312}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
