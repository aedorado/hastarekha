import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HastaRekhā Databank",
  description: "A centralized palmistry repository for classification, cataloging, and reference of hands and their features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          /* Force all padding utilities */
          .p-0 { padding: 0 !important; }
          .p-1 { padding: 0.25rem !important; }
          .p-2 { padding: 0.5rem !important; }
          .p-3 { padding: 0.75rem !important; }
          .p-3\\.5 { padding: 0.875rem !important; }
          .p-4 { padding: 1rem !important; }
          .p-5 { padding: 1.25rem !important; }
          .p-6 { padding: 1.5rem !important; }
          .p-8 { padding: 2rem !important; }

          .px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .px-1 { padding-left: 0.25rem !important; padding-right: 0.25rem !important; }
          .px-1\\.5 { padding-left: 0.375rem !important; padding-right: 0.375rem !important; }
          .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
          .px-2\\.5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
          .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .px-3\\.5 { padding-left: 0.875rem !important; padding-right: 0.875rem !important; }
          .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .px-5 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }

          .py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
          .py-1\\.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
          .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .py-5 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
          .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
          .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }

          .pt-0 { padding-top: 0 !important; }
          .pt-1 { padding-top: 0.25rem !important; }
          .pt-1\\.5 { padding-top: 0.375rem !important; }
          .pt-2 { padding-top: 0.5rem !important; }
          .pt-3 { padding-top: 0.75rem !important; }
          .pt-4 { padding-top: 1rem !important; }

          .pb-0 { padding-bottom: 0 !important; }
          .pb-1 { padding-bottom: 0.25rem !important; }
          .pb-1\\.5 { padding-bottom: 0.375rem !important; }
          .pb-2 { padding-bottom: 0.5rem !important; }
          .pb-3 { padding-bottom: 0.75rem !important; }
          .pb-4 { padding-bottom: 1rem !important; }

          .pl-0 { padding-left: 0 !important; }
          .pl-1 { padding-left: 0.25rem !important; }
          .pl-2 { padding-left: 0.5rem !important; }
          .pl-3 { padding-left: 0.75rem !important; }
          .pl-3\\.5 { padding-left: 0.875rem !important; }
          .pl-4 { padding-left: 1rem !important; }

          .pr-0 { padding-right: 0 !important; }
          .pr-1 { padding-right: 0.25rem !important; }
          .pr-2 { padding-right: 0.5rem !important; }
          .pr-3 { padding-right: 0.75rem !important; }
          .pr-4 { padding-right: 1rem !important; }

          /* ===== MARGINS - COMPREHENSIVE ===== */
          .m-0 { margin: 0 !important; }
          .m-1 { margin: 0.25rem !important; }
          .m-2 { margin: 0.5rem !important; }
          .m-3 { margin: 0.75rem !important; }
          .m-4 { margin: 1rem !important; }

          /* Horizontal margins */
          .mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
          .mx-1 { margin-left: 0.25rem !important; margin-right: 0.25rem !important; }
          .mx-2 { margin-left: 0.5rem !important; margin-right: 0.5rem !important; }
          .mx-3 { margin-left: 0.75rem !important; margin-right: 0.75rem !important; }
          .mx-4 { margin-left: 1rem !important; margin-right: 1rem !important; }
          .mx-auto { margin-left: auto !important; margin-right: auto !important; }

          /* Vertical margins */
          .my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          .my-1 { margin-top: 0.25rem !important; margin-bottom: 0.25rem !important; }
          .my-2 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
          .my-3 { margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; }
          .my-4 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
          .my-6 { margin-top: 1.5rem !important; margin-bottom: 1.5rem !important; }

          /* Top margins */
          .mt-0 { margin-top: 0 !important; }
          .mt-1 { margin-top: 0.25rem !important; }
          .mt-2 { margin-top: 0.5rem !important; }
          .mt-3 { margin-top: 0.75rem !important; }
          .mt-4 { margin-top: 1rem !important; }
          .mt-6 { margin-top: 1.5rem !important; }
          .mt-8 { margin-top: 2rem !important; }

          /* Bottom margins */
          .mb-0 { margin-bottom: 0 !important; }
          .mb-1 { margin-bottom: 0.25rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 0.75rem !important; }
          .mb-4 { margin-bottom: 1rem !important; }
          .mb-6 { margin-bottom: 1.5rem !important; }
          .mb-8 { margin-bottom: 2rem !important; }

          /* Left margins */
          .ml-0 { margin-left: 0 !important; }
          .ml-1 { margin-left: 0.25rem !important; }
          .ml-2 { margin-left: 0.5rem !important; }
          .ml-3 { margin-left: 0.75rem !important; }
          .ml-4 { margin-left: 1rem !important; }
          .ml-auto { margin-left: auto !important; }

          /* Right margins */
          .mr-0 { margin-right: 0 !important; }
          .mr-1 { margin-right: 0.25rem !important; }
          .mr-2 { margin-right: 0.5rem !important; }
          .mr-3 { margin-right: 0.75rem !important; }
          .mr-4 { margin-right: 1rem !important; }
          .mr-auto { margin-right: auto !important; }

          /* ===== GAPS - FOR FLEX & GRID ===== */
          .gap-0 { gap: 0 !important; }
          .gap-1 { gap: 0.25rem !important; }
          .gap-2 { gap: 0.5rem !important; }
          .gap-3 { gap: 0.75rem !important; }
          .gap-4 { gap: 1rem !important; }
          .gap-5 { gap: 1.25rem !important; }
          .gap-6 { gap: 1.5rem !important; }
          .gap-8 { gap: 2rem !important; }

          /* ===== SPACE-Y FOR STACKED CONTENT ===== */
          .space-y-0 > * + * { margin-top: 0 !important; }
          .space-y-1 > * + * { margin-top: 0.25rem !important; }
          .space-y-2 > * + * { margin-top: 0.5rem !important; }
          .space-y-3 > * + * { margin-top: 0.75rem !important; }
          .space-y-4 > * + * { margin-top: 1rem !important; }
          .space-y-5 > * + * { margin-top: 1.25rem !important; }
          .space-y-6 > * + * { margin-top: 1.5rem !important; }
          .space-y-8 > * + * { margin-top: 2rem !important; }

          /* ===== SPACE-X FOR INLINE CONTENT ===== */
          .space-x-1 > * + * { margin-left: 0.25rem !important; }
          .space-x-2 > * + * { margin-left: 0.5rem !important; }
          .space-x-3 > * + * { margin-left: 0.75rem !important; }
          .space-x-4 > * + * { margin-left: 1rem !important; }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f9f8f4] text-stone-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
