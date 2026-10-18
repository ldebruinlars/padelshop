import type { Metadata } from "next";
import { Admin } from "@/components/admin";

export const metadata: Metadata = {
  title: "Beheer | Racket Lab",
  robots: { index: false, follow: false },
};

export default function BeheerPage() {
  return <Admin />;
}
