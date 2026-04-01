import { type BusinessIdea } from "./api";

// REAL-FIRST: Mock data stripped for production hardening.
// All business ideas must be fetched from the backend via ventureApi.getInsights().
export const businessIdeas: BusinessIdea[] = [];

export { 
  type BusinessIdea as BusinessIdeaType,
  CATEGORY_COLORS,
  TREND_COLORS,
  ALL_CATEGORIES,
  ALL_MARKETS,
  ALL_TRENDS 
} from "./api";
