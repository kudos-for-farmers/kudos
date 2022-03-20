import Link from "next/link";
import React from "react";

// displays a page footer

export default function Footer() {
  return (
      <div className="flex flex-1 flex-col w-full items-center">
        <div className="text-center" style={{ margin: 64 }}>
          <Link href="/">award kudos</Link> |
           | <Link href="/proposals">proposals</Link> |
           | <Link href="/debug">developer screen</Link>
        </div>
      </div>
  );
}
