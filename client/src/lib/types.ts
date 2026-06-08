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

export interface Profile {
  id: string
  matchmakerId: string
  status: ProfileStatus
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: string
  age: number
  height: number
  bodyType: string
  complexion: string
  profilePhoto: string
  profileCreatedBy: ProfileCreatedBy
  email: string
  phoneNumber: string
  country: string
  city: string
  openToRelocate: OpenToRelocate
  undergraduateCollege: string
  degree: string
  educationDetails: string
  currentCompany: string
  designation: string
  annualIncome: number
  incomeCurrency: string
  workingWith: string
  professionArea: string
  maritalStatus: MaritalStatus
  haveChildren: boolean
  religion: string
  caste: string
  subCaste: string
  gothra: string
  motherTongue: string
  languagesKnown: string[]
  manglik: ManglikStatus
  starRaasi: string
  diet: Diet
  drinking: DrinkingHabit
  smoking: SmokingHabit
  hobbies: string[]
  aboutMe: string
  siblings: Sibling[]
  family: FamilyDetails
  wantKids: WantKids
  openToPets: OpenToPets
  partnerPreferences: PartnerPreferences
}

export interface User {
  id: string
  email: string
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

export interface MatchedProfile {
  profile: Profile
  score: number
  breakdown: ScoreBreakdown
  aiExplanation?: string
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
  key: string
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

export const STATUS_LABELS: Record<ProfileStatus, string> = {
  new: 'New',
  verified: 'Verified',
  searching: 'Searching',
  matches_sent: 'Matches Sent',
  in_conversation: 'In Conversation',
  meeting_scheduled: 'Meeting Scheduled',
  finalized: 'Finalized',
  on_hold: 'On Hold',
}

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  never_married: 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  awaiting_divorce: 'Awaiting Divorce',
}
