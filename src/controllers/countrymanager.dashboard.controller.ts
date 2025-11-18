// @ts-nocheck
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import prisma from '../DB/db';

export const getDashboardReportController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {

    const { country } = req.params;  // <-- countryId from URL
    // @ts-ignore
    const user = req.user;

    // Validate
    if (!country) {
      return res.status(400).json({
        success: false,
        message: "Country parameter is required",
      });
    }

    // ===================== 1. USERS BY ROLE ======================
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      where: { countryId: country },
      _count: { _all: true },
    });

    // ===================== 2. PROJECTS ===========================
    const projectsByStatus = await prisma.project.groupBy({
      by: ["status"],
      where: { countryId: country },
      _count: { _all: true },
    });

    const totalProjects = projectsByStatus.reduce(
      (acc, p) => acc + p._count._all,
      0
    );

    // ===================== 3. DONATIONS ==========================
    const totalDonationStats = await prisma.donation.aggregate({
      where: {
        project: {
          countryId: country,
        },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    // ===================== 4. EXPENSES ===========================
    const expenseByStatus = await prisma.expense.groupBy({
      by: ["status"],
      where: {
        project: {
          countryId: country,
        },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    // ===================== 5. ACTIVE VOLUNTEERS ==================
    const activeVolunteers = await prisma.user.count({
      where: {
        role: "volunteer",
        isActive: true,
        countryId: country,
      },
    });

    // ===================== 6. COUNTRY + PROVINCES ================
    const [totalCountries, totalProvinces] = await Promise.all([
      prisma.country.count(),
      prisma.province.count({
        where: { countryId: country },
      }),
    ]);

    // ===================== 7. TOP DONATION COUNTRIES =============
    const topCountries = await prisma.donation.groupBy({
      by: ["projectId"],
      where: {
        project: {
          countryId: country,
        },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const topCountryDonations = await Promise.all(
      topCountries.map(async (item) => {
        if (!item.projectId) return null;
        const project = await prisma.project.findUnique({
          where: { id: item.projectId },
          select: {
            title: true,
            country: { select: { countryName: true } },
          },
        });

        return {
          country: project?.country.countryName ?? "Unknown",
          project: project?.title,
          totalDonation: item._sum.amount ?? 0,
        };
      })
    );

    // ===================== 8. TOTAL MESSAGES =====================
    const totalMessages = await prisma.message.count({
      where: {
        toUser: { countryId: country },
      },
    });

    // ===================== 9. NOTIFICATIONS (NO FILTER!) =========
    const notificationForYou = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // ===================== FINAL RESPONSE =========================
    return res.status(200).json(
      new ApiResponse(true, 200, "Successfully fetched dashboard data", {
        usersByRole,
        totalProjects,
        projectsByStatus,
        totalDonation: totalDonationStats._sum.amount || 0,
        totalDonationsCount: totalDonationStats._count._all,
        expenseByStatus,
        activeVolunteers,
        totalCountries,
        totalProvinces,
        totalMessages,
        topCountryDonations: topCountryDonations.filter(Boolean),
        notificationForYou, // unchanged
      })
    );
  }
);
