import { Request, Response } from "express";

export class OrderController {
  constructor() {}

  create = async (req: Request, res: Response) => {
    res.json({ success: true });
  };
}
