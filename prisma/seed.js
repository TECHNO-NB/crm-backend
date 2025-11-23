"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// --- Configuration ---
const PLAIN_PASSWORD = 'password123';
const DOMAIN = 'test-seed.org';
// Minimal data for 2 countries
const MINIMAL_COUNTRY_DATA = [
    { name: 'India', code: 'IN', province: { name: 'Maharashtra', code: 'MH' } },
    { name: 'Canada', code: 'CA', province: { name: 'Ontario', code: 'ON' } },
];
// --- Utility Functions ---
function clearDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧹 Clearing existing data...');
        const tableNames = [
            'AuditLog', 'Notification', 'Message', 'Event', 'Asset', 'Ticket',
            'LegalCase', 'Donation', 'Expense', 'School', 'Project', 'User',
            'Province', 'Country',
        ];
        for (const tableName of tableNames.reverse()) {
            try {
                // @ts-ignore
                yield prisma[tableName].deleteMany({});
            }
            catch (e) {
                // Ignore errors during cleanup
            }
        }
        console.log('✅ Database clearance complete.');
    });
}
// --- Main Seeding Logic ---
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- STARTING MINIMAL TEST DATA SEED ---');
        yield clearDatabase();
        // 1. Seed Locations (2 Countries, 2 Provinces)
        console.log('1. Seeding Countries and Provinces...');
        const countryIndia = yield prisma.country.create({
            data: {
                countryName: MINIMAL_COUNTRY_DATA[0].name,
                code: MINIMAL_COUNTRY_DATA[0].code,
                provinces: { create: MINIMAL_COUNTRY_DATA[0].province },
            },
            include: { provinces: true },
        });
        const provinceIndiaId = countryIndia.provinces[0].id;
        const countryCanada = yield prisma.country.create({
            data: {
                countryName: MINIMAL_COUNTRY_DATA[1].name,
                code: MINIMAL_COUNTRY_DATA[1].code,
                provinces: { create: MINIMAL_COUNTRY_DATA[1].province },
            },
            include: { provinces: true },
        });
        // const provinceCanadaId = countryCanada.provinces[0].id; // Not used here
        // 2. Seed Users (3 Core Users)
        console.log('2. Seeding Core Users (Admin, Manager, Volunteer)...');
        // User A: Admin
        const userAdmin = yield prisma.user.create({
            data: {
                fullName: 'Admin User',
                email: `admin@${DOMAIN}`,
                phone: '+919999900001',
                password: PLAIN_PASSWORD,
                role: client_1.UserRole.admin,
                countryId: countryIndia.id,
                provinceId: provinceIndiaId,
                address: 'Admin HQ, Mumbai, IN',
            },
        });
        // User B: Project Manager (The Expense Submitter/Approver)
        const userManager = yield prisma.user.create({
            data: {
                fullName: 'Project Manager',
                email: `manager@${DOMAIN}`,
                phone: '+919999900002',
                password: PLAIN_PASSWORD,
                role: client_1.UserRole.country_manager,
                countryId: countryIndia.id,
                provinceId: provinceIndiaId,
                address: 'Manager Office, Pune, IN',
            },
        });
        // User C: Legal Volunteer (The Applicant/Respondent/Assigned)
        const userVolunteer = yield prisma.user.create({
            data: {
                fullName: 'Legal Volunteer',
                email: `volunteer@${DOMAIN}`,
                phone: '+919999900003',
                password: PLAIN_PASSWORD,
                role: client_1.UserRole.volunteer,
                countryId: countryIndia.id,
                provinceId: provinceIndiaId,
                address: 'Volunteer Home, Delhi, IN',
            },
        });
        // 3. Seed 1 Project
        console.log('3. Seeding 1 Project...');
        const project = yield prisma.project.create({
            data: {
                title: '[IN] Minimal Infrastructure Project',
                approved: client_1.ApprovedStatus.approved,
                status: client_1.ProjectStatus.active,
                countryId: countryIndia.id,
                provinceId: provinceIndiaId,
                managerId: userManager.id,
                budget: 50000,
                spent: 10000,
                documents: ['spec.pdf'],
                // Link Admin as a worker to test that relationship
                workers: { connect: [{ id: userAdmin.id }] }
            }
        });
        // 4. Seed 1 Expense (Submitted by Manager, Approved by Admin)
        console.log('4. Seeding 1 Expense...');
        yield prisma.expense.create({
            data: {
                amount: 500.50,
                category: client_1.ExpenseCategory.office_supplies,
                projectId: project.id,
                submittedById: userManager.id,
                approvedById: userAdmin.id,
                status: client_1.ExpenseStatus.approved,
                invoiceUrl: ['invoice-1.pdf'],
                countryId: countryIndia.id,
                date: new Date(),
            }
        });
        // 5. Seed 1 Legal Case (Testing complex user relations)
        console.log('5. Seeding 1 Legal Case...');
        yield prisma.legalCase.create({
            data: {
                caseNumber: 'IN-LD-2024-001',
                title: 'Land Dispute Test Case',
                category: client_1.LegalCategory.land,
                priority: client_1.LegalPriority.high,
                status: client_1.LegalCaseStatus.in_progress,
                // Testing the three named User relations
                applicantId: userVolunteer.id,
                respondentId: userManager.id,
                assignedToId: userAdmin.id,
                countryId: countryIndia.id,
                provinceId: provinceIndiaId,
                filingDate: new Date('2024-01-10'),
                documents: ['filing.pdf'],
            }
        });
        console.log('\n🎉 MINIMAL SEEDING SUCCESSFUL! All core relationships tested.');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
