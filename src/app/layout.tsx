import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
