import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Roboto_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import "./traficmx-security.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Traffic Dashboard",
  description: "Real-time traffic monitoring system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${robotoMono.variable} ${orbitron.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <WebSocketProvider>
              <PostHogProvider>
                {children}
              </PostHogProvider>
            </WebSocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
