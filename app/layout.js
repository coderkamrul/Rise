import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Discipline Self - Daily Task Tracker",
  description: "Track your daily discipline tasks and build better habits",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* Footer */}
<div className="pt-16 dark:bg-gradient-to-br dark:bg-slate-900 bg-gray-100 to-white">
  <footer className="border-t border-slate-700 py-8">
    <div className="container mx-auto px-4 text-center">
      <p className="text-slate-400">
        Built with ❤️ for the Discipline Challenge. © 2025 <br />
        Developed by {' '}
        <Link
          href="https://coderkamrul.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-300 hover:text-white transition-colors"
        >
          coderKamrul
        </Link>
      </p>
    </div>
  </footer>
</div>

        <Toaster />
      </body>
    </html>
  );
}
