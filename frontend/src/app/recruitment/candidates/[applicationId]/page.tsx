"use client";

import { use } from 'react';
import CandidateProfile from '../../components/CandidateProfile';

interface PageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default function CandidateProfilePage({ params }: PageProps) {
  const { applicationId } = use(params);

  return <CandidateProfile applicationId={applicationId} />;
}
