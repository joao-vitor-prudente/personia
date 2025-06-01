import { type Doc } from "@server/dataModel";
import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, Cake, MapPin, Mars, Venus } from "lucide-react";

import {
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export function ExperimentPersonaCard(props: { persona: Doc<"personas"> }) {
  return (
    <section className="grid grid-cols-[repeat(5,_1fr)_auto] items-center">
      <Link
        className="underline-offset-4 hover:underline"
        params={{ id: props.persona._id }}
        to="/personas/$id"
      >
        <TypographySmall>{props.persona.name}</TypographySmall>
      </Link>
      <TypographyMuted>{props.persona.nickname}</TypographyMuted>
      <TypographyMuted className="flex gap-2 items-center">
        <Cake />
        <span>{props.persona.demographicProfile.age}</span>
        <span>years</span>
      </TypographyMuted>
      <TypographyMuted className="flex gap-2 items-center">
        {props.persona.demographicProfile.gender === "male" ? (
          <Mars />
        ) : (
          <Venus />
        )}
        <span>
          {props.persona.demographicProfile.gender === "male"
            ? "Male"
            : "Female"}
        </span>
      </TypographyMuted>
      <TypographyMuted className="flex gap-2 items-center">
        <MapPin />
        <span>{props.persona.demographicProfile.country}</span>
        <span>-</span>
        <span>{props.persona.demographicProfile.state}</span>
      </TypographyMuted>
      <TypographyMuted className="flex gap-2 items-center">
        <BriefcaseBusiness />
        <span>{props.persona.demographicProfile.occupation}</span>
      </TypographyMuted>
    </section>
  );
}
