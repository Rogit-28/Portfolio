import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { TimelineEntry, EducationEntry, ScrollTimeline } from "@/components/sections/timeline";
import experienceData from "@/data/experience.json";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience and education background",
};

export default function ExperiencePage() {
  return (
    <Container className="pt-16 md:pt-24 pb-6">
      {/* Work Experience */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Experience</h1>
        <ScrollTimeline>
          {experienceData.work.map((job, index) => (
            <TimelineEntry
              key={`${job.company}-${job.startDate}`}
              company={job.company}
              role={job.role}
              startDate={job.startDate}
              endDate={job.endDate}
              current={job.current}
              location={job.location}
              achievements={job.achievements}
              index={index}
            />
          ))}
        </ScrollTimeline>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Education</h2>
        <ScrollTimeline>
          {experienceData.education.map((edu, index) => (
            <EducationEntry
              key={`${edu.institution}-${edu.startDate}`}
              institution={edu.institution}
              degree={edu.degree}
              field={edu.field}
              startDate={edu.startDate}
              endDate={edu.endDate}
              current={edu.current}
              grade={edu.grade}
              index={index}
            />
          ))}
        </ScrollTimeline>
      </section>
    </Container>
  );
}
