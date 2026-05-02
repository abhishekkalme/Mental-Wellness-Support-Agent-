import { Router, Request, Response, NextFunction } from "express";
import { agenticReply } from "../services/aiService";
import { z } from "zod";

import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { chatMessageSchema } from "../schemas";

const router = Router();

router.post("/message", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = chatMessageSchema.parse(req.body);
    const { userId, message } = validatedData;

    const reply = await agenticReply(userId, message);

    res.json({ success: true, data: { reply } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    next(error);
  }
});

export default router;
