import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { GlobalLoadingIndicator } from "@/components/common/global-loading-indicator";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stockelper",
  description: "Stockelper - 주식 투자 도우미",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <ReactQueryProvider>
          <GlobalLoadingIndicator />
          {children}
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
