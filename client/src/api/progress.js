import API from "./index";

export const getProgressSummary = () =>
  API.get("/progress/summary");
