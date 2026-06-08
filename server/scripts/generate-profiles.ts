import { faker } from '@faker-js/faker'
import * as fs from 'fs'
import * as path from 'path'
import type { Profile, MatchmakerAccount, Gender } from '../src/lib/types'

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai',
  'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur',
  'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
  'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
  'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur',
  'Gurgaon', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem',
  'Mangalore', 'Guntur', 'Warangal', 'Cuttack', 'Udaipur',
  'Dehradun', 'Kolhapur', 'Ajmer', 'Noida', 'Siliguri',
]

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi']
const CASTES_BY_RELIGION: Record<string, string[]> = {
  Hindu: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Yadav', 'Rajput', 'Maratha', 'Jat', 'Kayastha', 'Agarwal', 'Patel', 'Reddy', 'Nair', 'Ezhava', 'Vokkaliga', 'Kamma', 'Gounder', 'Lingayat', 'Baniya', 'Kurmi'],
  Muslim: ['Sunni', 'Shia', 'Syed', 'Mughal', 'Pathan', 'Sheikh'],
  Christian: ['Syrian Christian', 'Catholic', 'Protestant', 'CSI', 'Marthoma'],
  Sikh: ['Jatt', 'Khatri', 'Arora', 'Ramgarhia', 'Bhatra'],
  Jain: ['Oswal', 'Shwetambar', 'Digambar', 'Shrimal'],
  Buddhist: ['Marathi Buddhist', 'Hindu convert', 'Neo-Buddhist'],
  Parsi: ['Parsi', 'Irani'],
}

const MOTHER_TONGUES: Record<string, string[]> = {
  Hindi: ['Hindi'],
  Bengali: ['Bengali'],
  Marathi: ['Marathi'],
  Tamil: ['Tamil'],
  Telugu: ['Telugu'],
  Gujarati: ['Gujarati'],
  Kannada: ['Kannada'],
  Malayalam: ['Malayalam'],
  Punjabi: ['Punjabi'],
  Urdu: ['Urdu'],
  Odia: ['Odia'],
  Assamese: ['Assamese'],
  Maithili: ['Maithili'],
  Sindhi: ['Sindhi'],
}

const LANGUAGES_BY_MOTHER_TONGUE: Record<string, string[]> = {
  Hindi: ['Hindi', 'English'],
  Bengali: ['Bengali', 'Hindi', 'English'],
  Marathi: ['Marathi', 'Hindi', 'English'],
  Tamil: ['Tamil', 'English'],
  Telugu: ['Telugu', 'Hindi', 'English'],
  Gujarati: ['Gujarati', 'Hindi', 'English'],
  Kannada: ['Kannada', 'English'],
  Malayalam: ['Malayalam', 'English'],
  Punjabi: ['Punjabi', 'Hindi', 'English'],
  Urdu: ['Urdu', 'Hindi', 'English'],
  Odia: ['Odia', 'Hindi', 'English'],
  Assamese: ['Assamese', 'Hindi', 'English'],
  Maithili: ['Maithili', 'Hindi', 'English'],
  Sindhi: ['Sindhi', 'Hindi', 'English'],
}

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Kharagpur', 'IIT Kanpur', 'IIT Roorkee',
  'IIT Madras', 'BITS Pilani', 'NIT Trichy', 'NIT Surathkal', 'NIT Warangal',
  'Delhi University (St. Stephens)', 'Delhi University (SRCC)', 'Delhi University (LSR)',
  'Mumbai University (St. Xaviers)', 'Pune University (Fergusson)',
  'Jadavpur University', 'Calcutta University (Presidency)',
  'Anna University (CEG)', 'Osmania University', 'University of Hyderabad',
  'Manipal University', 'VIT Vellore', 'SRM Chennai', 'Amrita University',
  'Christ University Bangalore', 'St. Josephs Bangalore',
  'NMIMS Mumbai', 'SPJIMR Mumbai', 'XLRI Jamshedpur', 'IIM Ahmedabad',
  'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow', 'IIM Kozhikode',
  'AFMC Pune', 'AIIMS Delhi', 'CMC Vellore', 'JIPMER Pondicherry',
  'NLSIU Bangalore', 'NALSAR Hyderabad', 'NLU Delhi',
  'DTU Delhi', 'NSUT Delhi', 'IIIT Hyderabad', 'IIIT Bangalore',
]

const DEGREES = [
  'B.Tech (Computer Science)', 'B.Tech (Mechanical)', 'B.Tech (Electronics)',
  'B.Tech (Civil)', 'B.Tech (Information Technology)',
  'B.Com', 'B.Com (Hons)', 'BA (Economics)', 'BA (Psychology)', 'BA (English)',
  'B.Sc (Computer Science)', 'B.Sc (Mathematics)', 'B.Sc (Nursing)',
  'BBA', 'BHM', 'B.Des', 'B.Arch',
  'MBBS', 'BDS', 'BHMS', 'BAMS', 'LLB',
  'CA', 'CS', 'CMA',
  'M.Tech', 'MBA', 'MA', 'M.Sc', 'M.Com', 'MD', 'MS',
  'PhD', 'Post-Doctoral',
]

const DESIGNATIONS = [
  'Software Engineer', 'Senior Software Engineer', 'Principal Engineer',
  'Product Manager', 'Senior Product Manager',
  'Data Scientist', 'Machine Learning Engineer',
  'Investment Banker', 'Financial Analyst', 'Chartered Accountant',
  'Management Consultant', 'Business Analyst',
  'Doctor (MBBS)', 'Surgeon', 'Pediatrician', 'Cardiologist', 'Dentist',
  'Lawyer', 'Corporate Lawyer', 'Civil Judge',
  'Marketing Manager', 'Brand Manager', 'Digital Marketing Lead',
  'HR Manager', 'Talent Acquisition Lead',
  'Architect', 'Interior Designer',
  'IAS Officer', 'IPS Officer', 'IES Officer',
  'Professor', 'Lecturer', 'School Teacher',
  'Entrepreneur / Founder', 'Business Owner', 'Startup Co-Founder',
  'Civil Engineer', 'Mechanical Engineer', 'Design Engineer',
  'Airline Pilot', 'Merchant Navy Officer', 'Defence Officer',
  'Journalist', 'Content Writer', 'Editor',
  'Graphic Designer', 'UX Designer', 'UI Designer',
  'Research Scientist', 'Lab Director',
  'Veterinary Doctor', 'Wildlife Biologist',
]

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra',
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Uber',
  'Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Deloitte', 'EY', 'KPMG', 'PwC',
  'McKinsey & Company', 'BCG', 'Bain & Company',
  'Razorpay', 'Zomato', 'Swiggy', 'PhonePe', 'CRED',
  'Reliance Industries', 'Tata Group', 'Adani Group', 'Mahindra Group',
  'ICICI Bank', 'HDFC Bank', 'State Bank of India', 'Axis Bank',
  'Bharat Petroleum', 'Indian Oil', 'ONGC',
  'Flipkart', 'Myntra', 'Nykaa',
  'Ola', 'Oyo', 'MakeMyTrip',
  'Byjus', 'Unacademy', 'UpGrad',
  'Self-Employed / Freelancer',
  'Government of India - IAS', 'Indian Defence Services',
]

const HOBBIES_POOL = [
  'Reading', 'Traveling', 'Photography', 'Cooking', 'Baking',
  'Yoga', 'Meditation', 'Fitness', 'Running', 'Swimming',
  'Dancing', 'Singing', 'Playing Guitar', 'Listening to Music',
  'Painting', 'Sketching', 'Calligraphy',
  'Trekking', 'Camping', 'Cycling',
  'Watching Movies', 'Binge-watching Series',
  'Playing Cricket', 'Playing Badminton', 'Playing Chess',
  'Volunteering', 'Social Work',
  'Blogging', 'Writing Poetry',
  'Gardening', 'Bird Watching',
  'Learning Languages', 'Calligraphy',
  'Cooking Indian Cuisine', 'Baking Cakes',
  'Interior Design', 'Fashion & Styling',
  'Stock Market Trading', 'Crypto Investment',
]

const MALE_NAMES = {
  first: ['Aarav', 'Vihaan', 'Aadvik', 'Shaurya', 'Aryan', 'Kabir', 'Ishaan', 'Dhruv', 'Reyansh', 'Yash', 'Siddharth', 'Rohan', 'Arjun', 'Ravi', 'Vikram', 'Aditya', 'Karan', 'Rahul', 'Amit', 'Vivek', 'Manish', 'Sandeep', 'Nikhil', 'Abhishek', 'Pranav', 'Varun', 'Kunal', 'Gaurav', 'Rajat', 'Harsh', 'Tushar', 'Saurabh', 'Shashank', 'Karthik', 'Vishal', 'Darshan', 'Manoj', 'Aniket', 'Prateek', 'Sachin', 'Akash', 'Neeraj', 'Pankaj', 'Hemant', 'Girish', 'Amol', 'Shubham', 'Bhavesh', 'Nikunj', 'Shankar'],
  last: ['Sharma', 'Verma', 'Singh', 'Patel', 'Reddy', 'Kumar', 'Gupta', 'Joshi', 'Malhotra', 'Mehta', 'Agarwal', 'Chopra', 'Shah', 'Das', 'Bose', 'Sen', 'Mukherjee', 'Banerjee', 'Nair', 'Menon', 'Iyer', 'Rao', 'Naidu', 'Pillai', 'Shetty', 'Hegde', 'Deshmukh', 'Kulkarni', 'Patil', 'Jadhav', 'Pawar', 'Kadam', 'Yadav', 'Pandey', 'Tiwari', 'Mishra', 'Saxena', 'Srivastava', 'Sinha', 'Prasad', 'Thakur', 'Sahoo', 'Mahapatra', 'Patnaik', 'Swain', 'Kohli', 'Chauhan', 'Rawat', 'Negi', 'Bhatt'],
}

const FEMALE_NAMES = {
  first: ['Aanya', 'Aadhya', 'Ishita', 'Ananya', 'Saanvi', 'Anika', 'Aaradhya', 'Riya', 'Kavya', 'Priya', 'Neha', 'Pooja', 'Sneha', 'Divya', 'Shruti', 'Anjali', 'Shreya', 'Swati', 'Nandini', 'Lakshmi', 'Meera', 'Rekha', 'Deepika', 'Rashmi', 'Prachi', 'Nisha', 'Shweta', 'Tejaswini', 'Bhavana', 'Kirthana', 'Madhuri', 'Vaidehi', 'Shakti', 'Amrita', 'Ekta', 'Kajal', 'Manisha', 'Pallavi', 'Sunita', 'Asha', 'Lata', 'Sita', 'Radha', 'Gita', 'Usha', 'Mala', 'Trisha', 'Kriti', 'Avni', 'Tanya'],
  last: MALE_NAMES.last,
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function generateAge(gender: Gender): number {
  if (gender === 'male') return getRandomInt(25, 42)
  return getRandomInt(22, 38)
}

function generateHeight(gender: Gender): number {
  // Height in cm
  if (gender === 'male') return getRandomInt(165, 190)
  return getRandomInt(152, 175)
}

function generateIncome(gender: Gender, age: number, education: string): number {
  const base = gender === 'male' ? getRandomInt(4, 20) : getRandomInt(3, 15)
  const ageBonus = Math.floor((age - 22) * 0.5)
  const eduBonus = education.includes('BTech') || education.includes('MBA') || education.includes('MBBS') || education === 'CA' ? 5 : 0
  return (base + ageBonus + eduBonus) * 100000
}

function generateDOB(age: number): string {
  const d = faker.date.birthdate({ mode: 'age', min: age, max: age })
  return d.toISOString().split('T')[0]
}

function generateProfile(id: number, gender: Gender, matchmakerId: string): Profile {
  const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES
  const firstName = pickRandom(namePool.first)
  const lastName = pickRandom(MALE_NAMES.last) // shared last names
  const age = generateAge(gender)
  const city = pickRandom(INDIAN_CITIES)
  const religion = pickRandom(RELIGIONS)
  const castes = CASTES_BY_RELIGION[religion] || ['General']
  const caste = pickRandom(castes)
  const motherTongue = pickRandom(Object.keys(MOTHER_TONGUES))
  const languages = LANGUAGES_BY_MOTHER_TONGUE[motherTongue] || [motherTongue, 'English']
  const college = pickRandom(COLLEGES)
  const degree = pickRandom(DEGREES)
  const company = pickRandom(COMPANIES)
  const designation = pickRandom(DESIGNATIONS)
  const income = generateIncome(gender, age, degree)
  const height = generateHeight(gender)
  const hobbies = pickRandomN(HOBBIES_POOL, getRandomInt(2, 5))

  return {
    id: `profile_${String(id).padStart(4, '0')}`,
    matchmakerId,
    status: pickRandom(['new', 'verified', 'searching', 'matches_sent', 'in_conversation', 'meeting_scheduled', 'finalized', 'on_hold']),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),

    firstName,
    lastName,
    gender,
    dateOfBirth: generateDOB(age),
    age,
    height,
    bodyType: pickRandom(['slim', 'average', 'athletic', 'heavy']),
    complexion: pickRandom(['fair', 'wheatish', 'dark']),
    profilePhoto: `https://api.dicebear.com/8.x/${gender === 'male' ? 'avataaars' : 'avataaars'}/svg?seed=${firstName}${lastName}`,
    profileCreatedBy: pickRandom(['self', 'parent', 'sibling', 'guardian', 'friend']),

    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@email.com`,
    phoneNumber: `+91${String(9_000_000_000 + id).slice(0, 10)}`,

    country: 'India',
    city,
    openToRelocate: pickRandom(['yes', 'no', 'maybe']),

    undergraduateCollege: college,
    degree,
    educationDetails: `${degree} from ${college}`,

    currentCompany: company,
    designation,
    annualIncome: income,
    incomeCurrency: 'INR',
    workingWith: pickRandom(['Private Company', 'Government/Public Sector', 'Defense/Civil Services', 'Business/Self Employed', 'Not Working']),
    professionArea: pickRandom(['IT/Software', 'Finance/Banking', 'Medical/Healthcare', 'Engineering', 'Education', 'Government Services', 'Business', 'Arts/Media', 'Law', 'Consulting']),

    maritalStatus: pickRandom(['never_married', 'never_married', 'never_married', 'never_married', 'divorced', 'widowed']),
    haveChildren: Math.random() < 0.08,

    religion,
    caste,
    subCaste: pickRandom(['Sub-community 1', 'Sub-community 2', '']),
    gothra: pickRandom(['Kashyap', 'Bhardwaj', 'Vashishta', 'Vishwamitra', 'Atri', 'Jamadagni', 'Gautam', 'Shandilya', '']),
    motherTongue,
    languagesKnown: languages,
    manglik: pickRandom(['manglik', 'non_manglik', 'dont_know']),
    starRaasi: pickRandom(['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']),

    diet: pickRandom(['veg', 'non_veg', 'eggetarian', 'jain']),
    drinking: pickRandom(['no', 'no', 'occasionally', 'yes']),
    smoking: pickRandom(['no', 'no', 'no', 'occasionally']),
    hobbies,
    aboutMe: faker.lorem.paragraph({ min: 1, max: 3 }),

    siblings: [
      { type: 'brother', count: getRandomInt(0, 2), married: getRandomInt(0, 1) },
      { type: 'sister', count: getRandomInt(0, 2), married: getRandomInt(0, 1) },
    ],
    family: {
      type: pickRandom(['joint', 'nuclear']),
      values: pickRandom(['orthodox', 'conservative', 'moderate', 'liberal']),
      fatherOccupation: pickRandom(['Businessman', 'Government Officer', 'Engineer', 'Doctor', 'Lawyer', 'Professor', 'Retired', 'Farmer', 'Private Sector']),
      motherOccupation: pickRandom(['Homemaker', 'Teacher', 'Doctor', 'Nurse', 'Government Officer', 'Professor', 'Businesswoman', 'Banker', 'Social Worker']),
      property: pickRandom(['Own House', 'Flat', 'Villa', 'Agricultural Land', 'Multiple Properties']),
    },

    wantKids: pickRandom(['yes', 'yes', 'yes', 'no', 'maybe']),
    openToPets: pickRandom(['yes', 'no', 'maybe']),

    partnerPreferences: {
      ageMin: gender === 'male' ? age - 6 : age - 3,
      ageMax: gender === 'male' ? age - 1 : age + 7,
      heightMin: gender === 'male' ? 150 : 160,
      heightMax: gender === 'male' ? 170 : 190,
      incomeMin: gender === 'male' ? 0 : income,
      educationPreference: pickRandomN(DEGREES, 3),
      religionPreference: [religion],
      castePreference: [caste, 'Does not matter'],
      locationPreference: [city, ...pickRandomN(INDIAN_CITIES, 2)],
      dietPreference: pickRandomN(['veg', 'non_veg', 'eggetarian', 'jain'], 2),
      manglikPreference: pickRandomN(['manglik', 'non_manglik', 'dont_know'], 2),
      maritalStatusPreference: ['never_married'],
      wantKidsPreference: ['yes'],
      openToRelocatePreference: Math.random() > 0.5,
    },
  }
}

function generate(): void {
  const totalProfiles = 120
  const perMatchmaker = totalProfiles / 2

  const matchmakers: MatchmakerAccount[] = [
    {
      id: 'mm_001',
      email: 'priya@thedatecrew.com',
      password: '$2a$10$dummy',
      name: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Priya',
      assignedProfileIds: [],
    },
    {
      id: 'mm_002',
      email: 'rahul@thedatecrew.com',
      password: '$2a$10$dummy',
      name: 'Rahul Verma',
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Rahul',
      assignedProfileIds: [],
    },
  ]

  const profiles: Profile[] = []

  for (let i = 0; i < totalProfiles; i++) {
    const gender: Gender = i < 60 ? 'male' : 'female'
    const mmIdx = i < perMatchmaker ? 0 : 1
    const profile = generateProfile(i + 1, gender, matchmakers[mmIdx].id)
    profiles.push(profile)
    matchmakers[mmIdx].assignedProfileIds.push(profile.id)
  }

  const dataDir = path.resolve(__dirname, '../src/data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(path.join(dataDir, 'profiles.json'), JSON.stringify(profiles, null, 2))
  fs.writeFileSync(path.join(dataDir, 'matchmakers.json'), JSON.stringify(matchmakers, null, 2))

  console.log(`Generated ${profiles.length} profiles (60M + 60F)`)
  console.log(`Matchmaker 1 (${matchmakers[0].name}): ${matchmakers[0].assignedProfileIds.length} profiles`)
  console.log(`Matchmaker 2 (${matchmakers[1].name}): ${matchmakers[1].assignedProfileIds.length} profiles`)
  console.log(`Data written to ${dataDir}`)
}

generate()
