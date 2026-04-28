import Link from "next/link";
import { Calendar, HandHeart, LayoutGrid, Play } from "lucide-react";

const actions = [
  {
    title: "Sermons",
    description: "Watch messages on demand",
    icon: Play,
    href: "/sermons",
  },
  {
    title: "Events",
    description: "What’s happening this week",
    icon: Calendar,
    href: "/#events",
  },
  {
    title: "Give",
    description: "Partner with the mission",
    icon: HandHeart,
    href: "/contact#give",
  },
  {
    title: "Ministries",
    description: "Find where you belong",
    icon: LayoutGrid,
    href: "/ministries",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((a) => (
        <Link
          key={a.title}
          href={a.href}
          className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-6"
        >
          <div className="size-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <a.icon className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-black">{a.title}</h3>
          <p className="mt-1 text-white/70 text-sm leading-relaxed">
            {a.description}
          </p>
          <div className="mt-4 text-accent text-sm font-extrabold group-hover:underline">
            Open →
          </div>
        </Link>
      ))}
    </div>
  );
}
