import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  DonationMethod,
  DonationStatus,
  ExpenseStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Seed Countries
  const countries = [
    { countryName: "Nepal", code: "NP" },
    { countryName: "India", code: "IN" },
    { countryName: "Bhutan", code: "BT" },
    { countryName: "Bangladesh", code: "BD" },
    { countryName: "Sri Lanka", code: "LK" },
    { countryName: "Pakistan", code: "PK" },
    { countryName: "China", code: "CN" },
    { countryName: "Japan", code: "JP" },
    { countryName: "South Korea", code: "KR" },
    { countryName: "Thailand", code: "TH" },
    { countryName: "Myanmar", code: "MM" },
    { countryName: "Indonesia", code: "ID" },
    { countryName: "Malaysia", code: "MY" },
    { countryName: "Philippines", code: "PH" },
    { countryName: "Singapore", code: "SG" },
    { countryName: "Vietnam", code: "VN" },
    { countryName: "Cambodia", code: "KH" },
    { countryName: "Laos", code: "LA" },
    { countryName: "Maldives", code: "MV" },
    { countryName: "United States", code: "US" },
    { countryName: "United Kingdom", code: "GB" },
    { countryName: "Canada", code: "CA" },
    { countryName: "Australia", code: "AU" },
    { countryName: "Germany", code: "DE" },
    { countryName: "France", code: "FR" },
    { countryName: "Italy", code: "IT" },
    { countryName: "Spain", code: "ES" },
    { countryName: "Switzerland", code: "CH" },
    { countryName: "Norway", code: "NO" },
    { countryName: "Sweden", code: "SE" },
  ];

  await prisma.country.createMany({
    data: countries,
    skipDuplicates: true,
  });

  // ✅ Fetch Nepal to use as default country
  const country = await prisma.country.findFirst({
    where: { code: "NP" },
  });

  if (!country) throw new Error("Nepal not found in database!");

  // 2️⃣ Province
  const province = await prisma.province.create({
    data: {
      name: "Bagmati Province",
      code: "BAG",
      countryId: country.id,
    },
  });

  // 3️⃣ School
  const school = await prisma.school.create({
    data: {
      name: "Shree Janata Secondary School",
      provinceId: province.id,
      countryId: country.id,
      address: "Kathmandu, Nepal",
      studentCount: 1200,
      contactName: "Principal Shrestha",
      contactPhone: "9812345678",
      contactEmail: "principal@janata.edu.np",
      photos: ["https://res.cloudinary.com/demo/image/upload/school1.jpg"],
    },
  });

  // 4️⃣ Users
  const chairman = await prisma.user.create({
    data: {
      fullName: "Rajesh Sharma",
      email: "rajesh@ngo.org",
      password: "hashedpassword123",
      role: UserRole.chairman,
      countryId: country.id,
      provinceId: province.id,
      address: "Lalitpur, Nepal",
      phone: "9800000001",
    },
  });

  const manager = await prisma.user.create({
    data: {
      fullName: "Sita Lama",
      email: "sita@ngo.org",
      password: "hashedpassword123",
      role: UserRole.country_manager,
      countryId: country.id,
      provinceId: province.id,
      address: "Kathmandu, Nepal",
      phone: "9800000002",
    },
  });

  const volunteer = await prisma.user.create({
    data: {
      fullName: "Bikash Gurung",
      email: "bikash@ngo.org",
      password: "hashedpassword123",
      role: UserRole.volunteer,
      countryId: country.id,
      provinceId: province.id,
      address: "Bhaktapur, Nepal",
      phone: "9800000003",
    },
  });

  // 5️⃣ Project
  const project = await prisma.project.create({
    data: {
      title: "School Renovation Project",
      description: "Renovating rural schools and improving classroom facilities.",
      provinceId: province.id,
      managerId: manager.id,
      status: ProjectStatus.active,
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-06-30"),
      budget: 50000,
      spent: 12000,
      documents: ["https://res.cloudinary.com/demo/image/upload/project_doc1.pdf"],
      countryId: country.id,
    },
  });

  // 6️⃣ Donations
  await prisma.donation.createMany({
    data: [
      {
        donorName: "John Doe",
        donorEmail: "john@example.com",
        amount: 10000,
        method: DonationMethod.online,
        status: DonationStatus.completed,
        receivedAt: new Date(),
        projectId: project.id,
        receiptUrl: "https://res.cloudinary.com/demo/image/upload/receipt1.pdf",
      },
      {
        donorName: "Mary Smith",
        donorEmail: "mary@example.com",
        amount: 5000,
        method: DonationMethod.cash,
        status: DonationStatus.pending,
        projectId: project.id,
      },
    ],
  });

  // 7️⃣ Expenses
  await prisma.expense.createMany({
    data: [
      {
        amount: 2000,
        category: "Construction Materials",
        projectId: project.id,
        submittedById: volunteer.id,
        approvedById: manager.id,
        status: ExpenseStatus.approved,
        date: new Date(),
      },
      {
        amount: 1500,
        category: "Transport",
        projectId: project.id,
        submittedById: volunteer.id,
        approvedById: chairman.id,
        status: ExpenseStatus.pending,
        date: new Date(),
      },
    ],
  });

  // 8️⃣ Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: manager.id,
      action: "Created Project",
      collectionName: "Project",
      documentId: project.id,
      after: { projectName: project.title },
    },
  });

  // 9️⃣ Notification
  await prisma.notification.create({
    data: {
      userId: volunteer.id,
      channel: "in_app",
      title: "Project Assigned",
      body: "You have been assigned to the School Renovation Project.",
    },
  });

  // 🔟 Message
  await prisma.message.create({
    data: {
      fromUserId: manager.id,
      toUserId: volunteer.id,
      subject: "Meeting Reminder",
      body: "Please attend the project update meeting at 2 PM.",
      channel: "internal",
    },
  });

  // 11️⃣ Event
  await prisma.event.create({
    data: {
      title: "Monthly Progress Review",
      description: "Review of all ongoing projects.",
      startAt: new Date("2025-02-10T10:00:00Z"),
      organizerId: chairman.id,
      attendees: [{ id: manager.id, name: "Sita Lama", status: "confirmed" }],
      location: "Head Office, Kathmandu",
      attachments: [],
    },
  });

  // 12️⃣ Asset
  await prisma.asset.create({
    data: {
      name: "Laptop HP ProBook",
      type: "Electronics",
      ownerId: volunteer.id,
      purchaseDate: new Date("2024-12-01"),
      serialNo: "HP123456",
      status: "in_use",
      location: "Field Office",
    },
  });

  // 13️⃣ Ticket
  await prisma.ticket.create({
    data: {
      title: "Printer not working",
      description: "The office printer is showing a paper jam error.",
      requesterId: volunteer.id,
      assigneeId: manager.id,
      priority: "medium",
      status: "open",
      logs: { action: "reported" },
      attachments: [],
    },
  });

  console.log("✅ Seeding completed!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Seeding failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
