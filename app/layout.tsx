import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ReduxProvider } from "./store/provider";
import Header from "./components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Webcam Face Recognition",
  description: "Webcam Face Recognition Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}
      >
        <ReduxProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-4 text-center text-sm text-gray-600 border-t">
            <div className="container mx-auto">
              <p>Facial Recognition App &copy; {new Date().getFullYear()}</p>
            </div>
          </footer>
        </ReduxProvider>
      </body>
    </html>
  );
}
