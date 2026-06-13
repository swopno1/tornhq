import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  takeStatSnapshot,
  pollMarketPrices,
  runSlotsJob,
  triggerDailySlotsJobs,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [takeStatSnapshot, pollMarketPrices, runSlotsJob, triggerDailySlotsJobs],
});
