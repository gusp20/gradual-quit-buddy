import { NavLink } from "react-router-dom";
import { BarChart3, Cigarette, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/stats", icon: BarChart3, label: "Stats" },
  { to: "/", icon: Cigarette, label: "Today", primary: true },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
      <ul className="grid grid-cols-3 max-w-md mx-auto px-2 pt-2 pb-2">
        {items.map(({ to, icon: Icon, label, primary }) => (
          <li key={to} className="flex justify-center">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-smooth min-w-[72px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-2xl transition-smooth",
                      isActive && primary && "gradient-primary text-primary-foreground shadow-soft",
                      isActive && !primary && "bg-secondary",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span className="text-[11px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
