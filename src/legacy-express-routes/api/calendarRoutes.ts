import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/events/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    // Mock university calendar fetch
    const events = [
      { id: "e1", title: "Final Exam - Calculus", date: "2026-05-10" },
      { id: "e2", title: "Project Deadline", date: "2026-05-15" }
    ];

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

export default router;
