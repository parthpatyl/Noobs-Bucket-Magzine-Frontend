import { parseISO, format } from "date-fns";

export const formatDate = (dateInput, formatType = "dd MMM yyyy") => {
  if (!dateInput) return "Unknown Date"; // Handle missing/null values

  try {
    let dateObj;

    // Check if MongoDB Extended JSON format { "$date": "2025-01-11T00:00:00.000Z" }
    if (typeof dateInput === "object" && dateInput.$date) {
      dateObj = new Date(dateInput.$date);
    } 
    // If it's a string (like "2025-01-11T00:00:00.000Z"), parse it
    else if (typeof dateInput === "string" && !isNaN(Date.parse(dateInput))) {
      dateObj = parseISO(dateInput);
    } 
    // If it's already a Date object, use it directly
    else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      dateObj = dateInput;
    } 
    // If it's a timestamp number, convert it
    else if (typeof dateInput === "number") {
      dateObj = new Date(dateInput);
    } 
    // If nothing matches, return fallback text
    else {
      console.error("⚠️ Unrecognized date format:", dateInput);
      return "Invalid Date";
    }

    return format(dateObj, formatType);
  } catch (error) {
    console.error("❌ Error formatting date:", error);
    return "Invalid Date";
  }
};
