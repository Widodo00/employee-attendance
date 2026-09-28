import { z } from "zod";

export const clockInSchema = z.object({
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),

  longitude: z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
});

export type locationInterface = z.infer<typeof clockInSchema>;
