import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
    title: "Cyber Heist | Escape Room",
    description: "A neon-themed cybersecurity escape room quiz.",
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
