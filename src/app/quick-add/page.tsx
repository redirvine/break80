import QuickAddForm from "@/components/QuickAddForm";

export const dynamic = "force-dynamic";

export default function QuickAddPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Quick Add</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Log your score fast. You can add details later.
      </p>
      <QuickAddForm />
    </div>
  );
}
