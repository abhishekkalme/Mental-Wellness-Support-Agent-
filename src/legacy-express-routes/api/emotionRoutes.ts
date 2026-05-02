import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.post("/detect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, error: "message is required" });
      return;
    }

    // Call HuggingFace Emotion Service here
    const mockEmotion = { label: "stress", score: 0.92 };

    res.json({ success: true, data: mockEmotion });
  } catch (error) {
    next(error);
  }
});

export default router;
