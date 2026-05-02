import { z } from "zod";

export const chatMessageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

export const moodEntrySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  mood: z.enum(["excellent", "good", "okay", "bad", "terrible"]),
  intensity: z.number().min(1).max(10),
  notes: z.string().optional(),
});
