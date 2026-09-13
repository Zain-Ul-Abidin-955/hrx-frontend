import Link from "next/link";
import { CheckOutlined } from "@ant-design/icons";
import AuthTheme from "./components/AuthTheme";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const HIGHLIGHTS = [
  "Recruitment with an AI-powered ATS",
  "Attendance, leave, and self-service in one place",
  "An assistant that answers from your live HR data",
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="hrx-dark flex min-h-screen bg-nightColor font-[family-name:var(--font-poppins)] text-lightColor antialiased">
      {/* Form column */}
      <div className="flex w-full flex-col lg:w-[52%]">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-6 sm:px-0">
          <header className="pt-9">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-sm font-bold text-white">
                H
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-lightColor">
                HRX <span className="text-mutedColor">AI</span>
              </span>
            </Link>
          </header>

          <main className="flex flex-1 items-center py-12">
            <AuthTheme>{children}</AuthTheme>
          </main>
        </div>
      </div>

      {/* Brand column */}
      <aside className="hrx-grid relative hidden overflow-hidden border-l border-lineColor bg-nightSoftColor lg:flex lg:w-[48%] lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-20 top-10 h-[420px] w-[420px] rounded-full bg-accentColor/20 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-[320px] w-[320px] rounded-full bg-glowColor/10 blur-[110px]" />

        <div className="relative px-14 xl:px-20">
          <h2 className="max-w-md text-balance text-[2rem] font-semibold leading-tight tracking-tight">
            The workspace your HR team actually wants to open.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-mutedColor">
            Hiring, attendance, leave, and analytics share one source of truth —
            so nothing has to be reconciled by hand at the end of the month.
          </p>

          <ul className="mt-9 space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accentColor/15 text-[10px] text-glowColor">
                  <CheckOutlined />
                </span>
                <span className="text-sm text-lightColor/85">{item}</span>
              </li>
            ))}
          </ul>

          {/* compact echo of the assistant card from the landing page */}
          <div className="mt-12 max-w-md rounded-2xl border border-lineColor bg-panelColor/80 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-glowColor" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glowColor" />
              </span>
              <span className="text-xs font-medium text-lightColor">
                HRX Assistant
              </span>
            </div>
            <p className="text-xs leading-relaxed text-mutedColor">
              Overnight: 18 new applications screened, 3 above 90% match, and
              two leave requests waiting on your approval.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AuthLayout;
