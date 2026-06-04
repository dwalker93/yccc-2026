export const QUALIFICATION_LEVELS = [
  { value: "secondary", label: "Secondary / High School" },
  { value: "vocational", label: "Vocational Training" },
  { value: "diploma", label: "Diploma / Associate Degree" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "postgrad_diploma", label: "Postgraduate Diploma" },
  { value: "masters", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate (PhD / DBA)" },
] as const

export const FIELDS_OF_STUDY = [
  { value: "operational_management", label: "Operational Management" },
  { value: "food_beverage_service", label: "Food & Beverage Service" },
  { value: "business_marketing", label: "Business & Marketing" },
  { value: "culinary_arts", label: "Culinary Arts" },
  { value: "pastry_bakery", label: "Pastry & Bakery" },
  { value: "international_cookery", label: "International Cookery" },
  { value: "hospitality_management", label: "Hospitality Management" },
  { value: "tourism_event_management", label: "Tourism & Event Management" },
  { value: "other", label: "Other" },
] as const

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "self_employed", label: "Self-employed" },
] as const
