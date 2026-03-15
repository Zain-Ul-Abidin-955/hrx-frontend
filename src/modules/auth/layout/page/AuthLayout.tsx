interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-[50%] my-auto">
        {children}
      </div>

      {/* Right Section - HRX branding */}
      <div className="relative flex w-[50%] h-screen min-h-0 flex-col items-center justify-center text-white bg-primaryColor overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute" />
        <div className="relative flex flex-col items-center gap-6 px-8 text-center">
          {/* HRX logo / icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primaryColor ring-1 ring-white/20 backdrop-blur-sm">
            <span className="text-4xl font-bold tracking-tighter text-white">
              HRX
            </span>
          </div>
          <p className="text-slate-300 text-lg font-medium max-w-xs">
            Powerful AI System
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
