// src/components/exam/exam-metadata.tsx

import Head from "next/head";

import { useExamStore } from "@/lib/store/examStore";

export function ExamMetadata() {
  const { examName, subjectName, chapterName } = useExamStore();

  const getTitle = () => {
    if (chapterName && subjectName && examName) {
      return `${chapterName} | ${subjectName} | ${examName} - Your App Name`;
    }
    if (subjectName && examName) {
      return `${subjectName} | ${examName} - Your App Name`;
    }
    if (examName) {
      return `${examName} - Your App Name`;
    }

    return "Competitive Exams - Your App Name";
  };

  const getDescription = () => {
    if (chapterName && subjectName && examName) {
      return `Study ${chapterName} in ${subjectName} for ${examName} exam preparation`;
    }
    if (subjectName && examName) {
      return `${subjectName} study materials for ${examName} exam preparation`;
    }
    if (examName) {
      return `Prepare for ${examName} with our comprehensive study materials`;
    }

    return "Prepare for competitive exams with our comprehensive study materials";
  };

  return (
    <Head>
      <title>{getTitle()}</title>
      <meta content={getDescription()} name="description" />
      {/* Open Graph tags */}
      <meta content={getTitle()} property="og:title" />
      <meta content={getDescription()} property="og:description" />
      <meta content="website" property="og:type" />
      {/* Twitter Card tags */}
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={getTitle()} name="twitter:title" />
      <meta content={getDescription()} name="twitter:description" />
    </Head>
  );
}
