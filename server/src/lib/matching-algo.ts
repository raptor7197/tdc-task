import type { Profile, ScoreBreakdown, ScoringWeights, MatchedProfile } from './types'

function religionCasteScore(a: Profile, b: Profile, w: number): number {
  if (a.religion === b.religion) {
    if (a.caste === b.caste) return w
    return w * 0.5
  }
  return 0
}

function ageScore(a: Profile, b: Profile, maleCustomer: boolean, w: number): number {
  if (maleCustomer) {
    // Man expects younger woman
    const ageDiff = a.age - b.age
    if (ageDiff >= 2 && ageDiff <= 7) return w
    if (ageDiff >= 0 && ageDiff <= 1) return w * 0.7
    if (ageDiff >= 8 && ageDiff <= 12) return w * 0.5
    if (ageDiff < 0) return w * 0.3
    return w * 0.2
  } else {
    // Woman expects older man
    const ageDiff = b.age - a.age
    if (ageDiff >= 1 && ageDiff <= 7) return w
    if (ageDiff >= -2 && ageDiff <= 0) return w * 0.6
    if (ageDiff >= 8 && ageDiff <= 12) return w * 0.5
    if (ageDiff < -2) return w * 0.3
    return w * 0.2
  }
}

function educationScore(a: Profile, b: Profile, maleCustomer: boolean, w: number): number {
  const eduLevel = (deg: string): number => {
    if (deg.includes('PhD') || deg.includes('Post-Doctoral')) return 6
    if (deg.includes('MD') || deg.includes('MS') || deg === 'CA' || deg.includes('MBA')) return 5
    if (deg.includes('MBBS') || deg.includes('M.Tech') || deg.includes('MA') || deg.includes('M.Sc') || deg.includes('M.Com')) return 4
    if (deg.includes('B.Tech') || deg.includes('BE') || deg.includes('LLB') || deg.includes('BBA') || deg.includes('B.Des') || deg.includes('B.Arch')) return 3
    if (deg.includes('BA') || deg.includes('B.Com') || deg.includes('B.Sc')) return 2
    return 1
  }

  const aLevel = eduLevel(a.degree)
  const bLevel = eduLevel(b.degree)

  if (maleCustomer) {
    // Man typically higher or equal
    if (aLevel >= bLevel) return w
    if (aLevel + 1 >= bLevel) return w * 0.6
    return w * 0.3
  } else {
    // Woman: equal or higher education ok
    if (bLevel >= aLevel) return w
    if (bLevel + 1 >= aLevel) return w * 0.7
    return w * 0.4
  }
}

function incomeScore(a: Profile, b: Profile, maleCustomer: boolean, w: number): number {
  if (maleCustomer) {
    // Man earns more than woman
    if (a.annualIncome >= b.annualIncome * 1.2) return w
    if (a.annualIncome >= b.annualIncome) return w * 0.7
    if (a.annualIncome >= b.annualIncome * 0.8) return w * 0.4
    return w * 0.2
  } else {
    // Man earns more than woman (or equal)
    if (b.annualIncome >= a.annualIncome * 1.2) return w
    if (b.annualIncome >= a.annualIncome) return w * 0.7
    if (b.annualIncome >= a.annualIncome * 0.8) return w * 0.4
    return w * 0.2
  }
}

function heightScore(a: Profile, b: Profile, maleCustomer: boolean, w: number): number {
  if (maleCustomer) {
    // Man taller than woman
    if (a.height > b.height + 8) return w
    if (a.height > b.height) return w * 0.7
    if (a.height >= b.height - 5) return w * 0.4
    return w * 0.15
  } else {
    // Man taller than woman
    if (b.height > a.height + 8) return w
    if (b.height > a.height) return w * 0.7
    if (b.height >= a.height - 5) return w * 0.4
    return w * 0.15
  }
}

function locationScore(a: Profile, b: Profile, w: number): number {
  if (a.city === b.city) return w
  if (a.openToRelocate === 'yes' || b.openToRelocate === 'yes') return w * 0.7
  if (a.openToRelocate === 'maybe' || b.openToRelocate === 'maybe') return w * 0.5
  return w * 0.2
}

function wantKidsScore(a: Profile, b: Profile, w: number): number {
  if (a.wantKids === b.wantKids) {
    if (a.wantKids === 'maybe') return w * 0.7
    return w
  }
  if (
    (a.wantKids === 'maybe' && b.wantKids !== 'no') ||
    (b.wantKids === 'maybe' && a.wantKids !== 'no')
  ) {
    return w * 0.4
  }
  return 0
}

function dietScore(a: Profile, b: Profile, w: number): number {
  if (a.diet === b.diet) return w
  if (a.diet === 'veg' && b.diet === 'eggetarian') return w * 0.5
  if (b.diet === 'veg' && a.diet === 'eggetarian') return w * 0.5
  if (a.diet === 'non_veg' && b.diet !== 'jain') return w * 0.3
  if (b.diet === 'non_veg' && a.diet !== 'jain') return w * 0.3
  return 0
}

function familyValuesScore(a: Profile, b: Profile, w: number): number {
  const values: Record<string, number> = { orthodox: 1, conservative: 2, moderate: 3, liberal: 4 }
  const diff = Math.abs((values[a.family.values] || 2) - (values[b.family.values] || 2))
  if (diff === 0) return w
  if (diff === 1) return w * 0.7
  if (diff === 2) return w * 0.4
  return w * 0.15
}

function lifestyleScore(a: Profile, b: Profile, w: number): number {
  let score = 0
  let factors = 0

  // Open to pets
  if (a.openToPets === b.openToPets) {
    score += 1
  } else if (a.openToPets === 'maybe' || b.openToPets === 'maybe') {
    score += 0.3
  }
  factors += 1

  // Drinking
  if (a.drinking === b.drinking) {
    score += 1
  } else if (a.drinking === 'occasionally' || b.drinking === 'occasionally') {
    score += 0.4
  }
  factors += 1

  // Smoking
  if (a.smoking === b.smoking) {
    score += 1
  } else if (a.smoking === 'occasionally' || b.smoking === 'occasionally') {
    score += 0.3
  }
  factors += 1

  // Family type preference
  if (a.family.type === b.family.type) {
    score += 1
  }
  factors += 1

  return (score / factors) * w
}

function computeBreakdown(
  customer: Profile,
  match: Profile,
  weights: ScoringWeights,
): ScoreBreakdown {
  const maleCustomer = customer.gender === 'male'

  return {
    religionCaste: religionCasteScore(customer, match, weights.religionCaste),
    age: ageScore(customer, match, maleCustomer, weights.age),
    education: educationScore(customer, match, maleCustomer, weights.education),
    income: incomeScore(customer, match, maleCustomer, weights.income),
    height: heightScore(customer, match, maleCustomer, weights.height),
    location: locationScore(customer, match, weights.location),
    wantKids: wantKidsScore(customer, match, weights.wantKids),
    diet: dietScore(customer, match, weights.diet),
    familyValues: familyValuesScore(customer, match, weights.familyValues),
    lifestyle: lifestyleScore(customer, match, weights.lifestyle),
  }
}

function totalScore(breakdown: ScoreBreakdown): number {
  return Math.round(
    breakdown.religionCaste +
      breakdown.age +
      breakdown.education +
      breakdown.income +
      breakdown.height +
      breakdown.location +
      breakdown.wantKids +
      breakdown.diet +
      breakdown.familyValues +
      breakdown.lifestyle,
  )
}

export function findMatches(
  customer: Profile,
  candidates: Profile[],
  weights: ScoringWeights,
  limit: number = 15,
): MatchedProfile[] {
  const maleCustomer = customer.gender === 'male'

  const scored = candidates
    .filter((c) => c.id !== customer.id)
    .filter((c) => c.gender !== customer.gender)
    .map((c) => {
      const breakdown = computeBreakdown(customer, c, weights)
      const score = totalScore(breakdown)
      return { profile: c, score, breakdown }
    })
    .filter((m) => m.score >= 30) // minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}

export { computeBreakdown, totalScore }
