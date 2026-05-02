import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Sync Habits
router.post("/sync/habits", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, habits } = req.body;
    // In production, sync `habits` to Postgres/MongoDB for `userId`
    res.json({ success: true, message: `Synced ${habits?.length || 0} habits for ${userId}` });
  } catch (error) {
    next(error);
  }
});

// Sync Goals
router.post("/sync/goals", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, goals } = req.body;
    res.json({ success: true, message: `Synced ${goals?.length || 0} goals for ${userId}` });
  } catch (error) {
    next(error);
  }
});

// Sync Sleep
router.post("/sync/sleep", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, sleepEntries } = req.body;
    res.json({ success: true, message: `Synced ${sleepEntries?.length || 0} sleep records for ${userId}` });
  } catch (error) {
    next(error);
  }
});

export default router;
