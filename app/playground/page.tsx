"use client";

import { useState } from "react";
import { FullPageLoader } from "@/components/ui/full-page-loader";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hello world</h1>
      <p className="mb-4">Some content that will be blurred when loading...</p>

      <button
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 3000); // Auto-hide after 3s
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Show Loader (3s)
      </button>

      {isLoading && <FullPageLoader text="Loading..." />}
    </div>
  );
}
