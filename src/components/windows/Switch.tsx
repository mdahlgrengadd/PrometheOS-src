import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export type WindowsSwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
>;

export function WindowsSwitch({ className, ...props }: WindowsSwitchProps) {
  return (
    <SwitchPrimitive.Root asChild {...props}>
      <div
        className={cn(
          "peer inline-flex h-[0.75rem] w-[1.375rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block h-[0.625rem] w-[0.625rem] rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[0.57rem] data-[state=unchecked]:translate-x-0" />
      </div>
    </SwitchPrimitive.Root>
  );
}

WindowsSwitch.displayName = "WindowsSwitch";
