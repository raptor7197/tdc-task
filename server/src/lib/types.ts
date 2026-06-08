export type Gender = 'male' | 'female'
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'awaiting_divorce'
export type Diet = 'veg' | 'non_veg' | 'eggetarian' | 'jain'
export type WantKids = 'yes' | 'no' | 'maybe'
export type OpenToRelocate = 'yes' | 'no' | 'maybe'
export type OpenToPets = 'yes' | 'no' | 'maybe'
export type FamilyType = 'joint' | 'nuclear'
export type FamilyValues = 'orthodox' | 'conservative' | 'moderate' | 'liberal'
export type ProfileStatus = 'new' | 'verified' | 'searching' | 'matches_sent' | 'in_conversation' | 'meeting_scheduled' | 'finalized' | 'on_hold'
export type ProfileCreatedBy = 'self' | 'parent' | 'sibling' | 'guardian' | 'friend'
export type ManglikStatus = 'manglik' | 'non_manglik' | 'dont_know'
export type DrinkingHabit = 'no' | 'yes' | 'occasionally'
export type SmokingHabit = 'no' | 'yes' | 'occasionally'
export type BodyType = 'slim' | 'average' | 'athletic' | 'heavy'

export interface Sibling {
  type: 'brother' | 'sister'
  count: number
  married: number
}

export interface FamilyDetails {
  type: FamilyType
  values: FamilyValues
  fatherOccupation: string
  motherOccupation: string
  property: string
}

export interface Profile {
  id: string
  matchmakerId: string
  status: ProfileStatus
  createdAt: string
  updatedAt: string

  // Basic
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: string
  age: number
  height: number
  bodyType: BodyType
  complexion: string
  profilePhoto: string
  profileCreatedBy: ProfileCreatedBy

  // Contact
  email: string
  phoneNumber: string

  // Location
  country: string
  city: string
  openToRelocate: OpenToRelocate

  // Education
  undergraduateCollege: string
  degree: string
  educationDetails: string

  // Career
  currentCompany: string
  designation: string
  annualIncome: number
  incomeCurrency: string
  workingWith: string
  professionArea: string

  // Marital
  maritalStatus: MaritalStatus
  haveChildren: boolean

  // Cultural & Religious
  religion: string
  caste: string
  subCaste: string
  gothra: string
  motherTongue: string
  languagesKnown: string[]
  manglik: ManglikStatus
  starRaasi: string

  // Lifestyle
  diet: Diet
  drinking: DrinkingHabit
  smoking: SmokingHabit
  hobbies: string[]
  aboutMe: string

  // Family
  siblings: Sibling[]
  family: FamilyDetails

  // Preferences
  wantKids: WantKids
  openToPets: OpenToPets
  partnerPreferences: PartnerPreferences
}

export interface PartnerPreferences {
  ageMin: number
  ageMax: number
  heightMin: number
  heightMax: number
  incomeMin: number
  educationPreference: string[]
  religionPreference: string[]
  castePreference: string[]
  locationPreference: string[]
  dietPreference: Diet[]
  manglikPreference: ManglikStatus[]
  maritalStatusPreference: MaritalStatus[]
  wantKidsPreference: WantKids[]
  openToRelocatePreference: boolean
}

export interface MatchmakerAccount {
  id: string
  email: string
  password: string
  name: string
  avatar: string
  assignedProfileIds: string[]
}

export interface Note {
  id: string
  profileId: string
  matchmakerId: string
  content: string
  type: 'call' | 'meeting' | 'email' | 'general'
  sentiment: 'positive' | 'neutral' | 'negative'
  createdAt: string
}

export interface MatchedProfile {
  profile: Profile
  score: number
  breakdown: ScoreBreakdown
  aiExplanation?: string
}

export interface ScoreBreakdown {
  religionCaste: number
  age: number
  education: number
  income: number
  height: number
  location: number
  wantKids: number
  diet: number
  familyValues: number
  lifestyle: number
}

export interface ScoringWeights {
  religionCaste: number
  age: number
  education: number
  income: number
  height: number
  location: number
  wantKids: number
  diet: number
  familyValues: number
  lifestyle: number
}

export interface ScoringPreset {
  label: string
  description: string
  weights: ScoringWeights
}

export interface ScoringConfig {
  activePreset: string | null
  weights: ScoringWeights
  weightsFemale: ScoringWeights
  custom: boolean
}

export interface MatchHistoryEntry {
  id: string
  customerProfileId: string
  matchedProfileId: string
  matchmakerId: string
  status: 'sent' | 'accepted' | 'declined' | 'pending'
  aiIntro: string
  sentAt: string
  respondedAt?: string
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  religionCaste: 25,
  age: 15,
  education: 10,
  income: 10,
  height: 5,
  location: 10,
  wantKids: 10,
  diet: 5,
  familyValues: 5,
  lifestyle: 5,
}

export const DEFAULT_WEIGHTS_FEMALE: ScoringWeights = {
  religionCaste: 20,
  age: 12,
  education: 15,
  income: 10,
  height: 5,
  location: 12,
  wantKids: 12,
  diet: 5,
  familyValues: 5,
  lifestyle: 4,
}

export const PRESETS: Record<string, ScoringPreset> = {
  traditional: {
    label: 'Traditional Indian',
    description: 'Prioritizes religion, caste, age norms, and family values — reflects conventional Indian matchmaking',
    weights: {
      religionCaste: 25,
      age: 15,
      education: 10,
      income: 10,
      height: 5,
      location: 10,
      wantKids: 10,
      diet: 5,
      familyValues: 5,
      lifestyle: 5,
    },
  },
  modern: {
    label: 'Modern / Progressive',
    description: 'De-emphasizes caste/religion, prioritizes education, lifestyle alignment, and shared values',
    weights: {
      religionCaste: 5,
      age: 10,
      education: 15,
      income: 10,
      height: 3,
      location: 12,
      wantKids: 15,
      diet: 5,
      familyValues: 10,
      lifestyle: 15,
    },
  },
  balanced: {
    label: 'Balanced',
    description: 'A middle ground — respects cultural factors while valuing personal compatibility',
    weights: {
      religionCaste: 15,
      age: 12,
      education: 12,
      income: 10,
      height: 4,
      location: 12,
      wantKids: 12,
      diet: 5,
      familyValues: 8,
      lifestyle: 10,
    },
  },
}
