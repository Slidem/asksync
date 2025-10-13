import { defaultConfig } from "@asksync/shared";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to {defaultConfig.appName}
            </h1>
            <p className="text-lg text-gray-600">
              A Next.js SSG + Convex + Shared Package Demo
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
