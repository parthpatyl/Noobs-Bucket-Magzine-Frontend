import { parseISO, format } from "date-fns";

export const formatDate = (dateString, formatType = "dd MMMM yyyy") => {
    if (!dateString) return "Unknown Date";
    return format(parseISO(dateString), formatType);
};
