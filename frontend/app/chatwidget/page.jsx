import WidgetChat from "@/components/WidgetChat";

export default function WidgetPage({ searchParams }) {
  if (searchParams?.embed === "1") {
    return (
      <main className="min-h-screen bg-transparent p-2">
        <WidgetChat />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] p-4 text-zinc-950">
      <WidgetChat />
    </main>
  );
}
