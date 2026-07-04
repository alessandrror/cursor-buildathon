import { PublicNavbar } from "@/components/layout/public-navbar";

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-semibold">AI Call Assistant</h1>
        <p className="mt-2 max-w-md text-center text-neutral-600 dark:text-neutral-400">
          Proyecto inicializado. La landing y el design system se implementarán
          en la siguiente fase.
        </p>
      </main>
    </>
  );
}
