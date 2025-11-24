// controllers/projectController.ts

import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import prisma from "../DB/db";

export const getRecentProjectsController = asyncHandler(
  async (req: Request, res: Response) => {
    
    // How many projects you want? Default = 4
    const limit = Number(req.query.limit) || 4;

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        province: true,
        country: true
      }
    });

    // Format data as you showed
    const formatted = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      startAt: p.startDate,
      location:
        p.country?.countryName ||
        "Not specified",
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  }
);
