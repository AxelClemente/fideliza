import type { Metadata } from "next";
import { Open_Sans, Poppins } from 'next/font/google';
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Fideliza",
  description: "Your Local Favorites App",
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${openSans.variable} ${poppins.variable} font-sans antialiased
          overflow-x-hidden
          [&_h1]:text-h1
          [&_h2]:text-h2
          [&_h3]:text-h3
          text-body-regular-1`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
