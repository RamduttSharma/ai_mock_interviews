import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, signOut } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex flex-row justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
        <button style={{cursor:"pointer", display:"flex" }} onClick={signOut}>
          <img src="/image.png" alt='signOut' width={"37px"}/>
          <p style={{height:"50%", marginTop:"5px"}}>signOut</p>
        </button>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
