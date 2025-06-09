import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SidebarToggleButton = () => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-10 transition-all duration-300",
        !open && "left-1/2 -translate-x-1/2 flex items-center justify-center",
        open && "right-2"
      )}
    >
      <SidebarTrigger
        className={cn(
          "rounded-full bg-white shadow-md border border-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 p-1 flex items-center justify-center",
          open &&
            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        )}
        onClick={() => setOpen(!open)}
      />
    </div>
  );
};

export default SidebarToggleButton;
