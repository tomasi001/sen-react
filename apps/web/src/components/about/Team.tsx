import Image from "next/image";

import { absoluteMediaUrl, listTeamMembers, type TeamMember } from "@/lib/cms";

/**
 * Team — pulled from the Payload TeamMembers collection (D008 — no
 * hardcoded copy). When `photo` is empty (REACT-side pending per
 * docs/pending-react-input.md), the card renders an initials
 * placeholder so the layout doesn't shift when real headshots arrive.
 */
function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Initials({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-lg font-semibold text-white"
    >
      {initialsOf(name)}
    </span>
  );
}

function Avatar({ member }: { member: TeamMember }) {
  const photoUrl = absoluteMediaUrl(
    typeof member.photo === "object" && member.photo ? member.photo.url : null,
  );
  if (!photoUrl) return <Initials name={member.name} />;
  return (
    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
      <Image
        src={photoUrl}
        alt={
          member.photo && typeof member.photo === "object"
            ? (member.photo.alt ?? member.name)
            : member.name
        }
        fill
        sizes="64px"
        className="object-cover"
      />
    </span>
  );
}

export async function Team() {
  const members = await listTeamMembers();
  if (members.length === 0) return null;

  return (
    <section className="border-b border-[color:var(--color-border)]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">
            Équipe
          </p>
          <h2 className="text-3xl font-bold leading-tight">Les personnes qui animent REACT</h2>
        </header>

        <ul className="grid gap-6 sm:grid-cols-2">
          {members.map((member) => (
            <li
              key={member.slug}
              className="flex items-center gap-4 rounded-lg border border-[color:var(--color-border)] bg-white p-5"
            >
              <Avatar member={member} />
              <div>
                <p className="text-base font-semibold leading-tight">{member.name}</p>
                <p className="text-sm text-[color:var(--color-muted)]">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
