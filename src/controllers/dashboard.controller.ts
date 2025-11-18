import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import prisma from '../DB/db';

export const getDashboardReportController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // --- 1. Total Users by Role ---
    // @ts-ignore
    const user = req.user;
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    // --- 2. Total Projects + by Status ---
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const totalProjects = projectsByStatus.reduce((acc, p) => acc + p._count._all, 0);

    // --- 3. Total Donations ---
    const totalDonationStats = await prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
    });

    // --- 4. Expenses summary ---
    const expenseByStatus = await prisma.expense.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { _all: true },
    });

    // --- 5. Active Volunteers count ---
    const activeVolunteers = await prisma.user.count({
      where: { role: 'volunteer', isActive: true },
    });

    // --- 6. Country + Province count ---
    const [totalCountries, totalProvinces] = await Promise.all([
      prisma.country.count(),
      prisma.province.count(),
    ]);

    // --- 7. Top performing countries by total donations ---
    const topCountries = await prisma.donation.groupBy({
      by: ['projectId'],
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Enrich with country names
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
          country: project?.country.countryName || 'Unknown',
          project: project?.title,
          totalDonation: item._sum.amount,
        };
      })
    );

    // --- 8. Total Messages (optional) ---
    const totalMessages = await prisma.message.count();

    const notificationForYou = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // --- Final Response ---
    return res.status(200).json(
      new ApiResponse(true, 200, 'Successfully fetched dashboard data', {
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
        notificationForYou,
      })
    );
  }
);
