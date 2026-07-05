export type PublicVoiceProfile = {
  id: string;
  displayName: string;
  status: string;
  requiresVerification: boolean;
  useForSuspiciousCalls: boolean;
  interactionMode: string;
  sampleCount: number;
  errorMessage: string | null;
  consentedAt: string | null;
  consentVersion: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VoiceCloneApiResponse = {
  profile: PublicVoiceProfile;
};

export type VoiceCloneErrorResponse = {
  error: string;
  code?: string;
};
