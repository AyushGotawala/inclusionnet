# InclusionNet: Peer-to-Peer Lending Platform with ML-Powered Credit Assessment and Real-Time Matching

**Author Name**  
**Course / Department**  
**College Name**  
**City, State**  
**email@example.com**

**Guide Name**  
**Designation**  
**College Name**  
**City, State**  
**guide@college.edu**

---

## Abstract

This project presents InclusionNet, an automated peer-to-peer (P2P) lending platform designed to connect borrowers and lenders directly while supporting loan applications, KYC verification, credit assessment, and loan matching. The system processes user and financial data using an integrated rule-based credit eligibility framework and intelligent matching algorithms to provide actionable lending insights. A multi-stage architecture is implemented, where eligibility is computed using Fixed Obligations to Income Ratio (FOIR), Debt-to-Income (DTI) analysis, risk categorization, and maximum loan amount calculation. Loan matching is performed using criteria such as available funds, interest rate preferences, credit score filters, and tenure constraints.

For real-time communication, Socket.io enables WhatsApp-like chat between borrowers and lenders, with read receipts and typing indicators. A rule-based eligibility engine combines income, existing EMI, tenure, risk category, and FOIR to assign maximum eligible loan amounts and estimated EMIs. The system generates dashboards containing loan status, matching lenders or loans, credit score display, and KYC status for enhanced transparency.

Designed for practical deployment, the implementation uses Node.js and Express on the backend with React on the frontend, and PostgreSQL with Prisma ORM for data persistence. The eligibility module follows FOIR-based calculations with risk multipliers (Low, Medium, High) and supports tenures from 6 to 60 months. The complete flow supports user registration, KYC upload and approval, loan application submission, matching, loan requests, and chat—all within a unified modular framework. This approach supports financial inclusion, reduces dependence on traditional banks for small loans, and provides a scalable foundation for future integration with external credit bureaus and advanced ML-based credit scoring models.

**Keywords—** Peer-to-Peer Lending, P2P Lending, KYC Verification, Loan Eligibility, FOIR, Debt-to-Income Ratio, Loan Matching, Real-Time Chat, JWT Authentication, React, Node.js, Express, Prisma, PostgreSQL, Socket.io, Financial Inclusion, Credit Assessment, Support Ticket System, Admin Dashboard.

---

## I. INTRODUCTION

Access to formal credit remains a challenge for many individuals, especially those without extensive credit history or collateral. Traditional banks often rely on manual underwriting, rigid eligibility criteria, and lengthy approval processes, leading to delayed disbursals and exclusion of creditworthy borrowers. Conventional lending systems suffer from time-consuming manual verification and approval workflows, inconsistent treatment of similar applicants, and fragmented experiences where loan discovery, application, and communication happen across multiple channels.

This project presents InclusionNet, a Peer-to-Peer Lending Platform designed to enhance financial inclusion through direct borrower–lender connection, automated eligibility assessment, and transparent loan matching. The system is built using JavaScript across the stack: React for the frontend and Node.js with Express for the backend. For data persistence and business logic, the project uses Prisma ORM with PostgreSQL. Eligibility calculations leverage rule-based algorithms including FOIR (Fixed Obligations to Income Ratio), DTI (Debt-to-Income) analysis, and risk-based loan amount multipliers. Credit score fields are included in the data model to support future ML-based scoring integration.

The frontend provides role-specific dashboards for borrowers, lenders, and administrators, developed using React with Tailwind CSS for responsive interaction. The backend handles user authentication with JWT, KYC document upload and approval, loan application and status management, matching of lenders to loan applications (and loans to lenders), and real-time chat via Socket.io. Upon registration and KYC approval, borrowers can submit loan applications, view eligibility and maximum loan amounts, see matching lenders, and send or receive loan requests. Lenders can set interest rates and available funds, browse matching loan opportunities, and communicate with borrowers. Results are displayed on interactive dashboards with application status, matching lists, and a unified chat interface, with a comprehensive support ticket system for user assistance. This technology stack enables borrowers and lenders to discover opportunities, assess eligibility, and transact within a single, secure platform.

---

## II. PROPOSED METHODOLOGY

### A. Proposed Solution

This project proposes a comprehensive Peer-to-Peer Lending Platform that integrates web technologies, rule-based eligibility, and intelligent matching to address gaps in traditional lending. The solution uses FOIR-based calculations to determine maximum eligible loan amount and estimated EMI for various tenures. The system accepts user registration, KYC documents (Aadhaar, PAN), and loan applications with purpose, amount, and tenure, and computes eligibility in real time. Each borrower view includes maximum eligible loan, DTI, risk category, and tenure-wise eligibility; each lender view includes matching loans filterable by credit score and tenure.

The Express-based backend manages user authentication (JWT), KYC upload and admin approval, loan application CRUD, eligibility computation, matching queries (matching lenders for a loan, matching loans for a lender), loan request lifecycle, chat messaging, and support tickets. A role-based dashboard gives borrowers: eligibility summary, application status, matching lenders, and chat; lenders: available funds, matching loans, and chat; and admins: KYC review, loan review with remarks, and support ticket management. The modular architecture allows scalability for many concurrent users and reliability through validation and error handling.

### B. System Design

The system architecture comprises multiple integrated layers. The **presentation layer** includes a React frontend with Tailwind CSS, providing registration, login, role-specific dashboards, KYC upload, loan application form, eligibility display, matching lists, loan request flows, chat interface, and support ticket creation. The **application layer** consists of an Express backend handling HTTP requests, JWT authentication, role checks, and orchestration of controllers and services. The **business logic layer** implements eligibility (FOIR, DTI, risk category, max loan, EMI), matching (getMatchingLendersForLoan, getMatchingLoansForLender with filters), loan request creation and status updates, and chat message persistence. The **data layer** uses Prisma ORM with PostgreSQL for users, borrower/lender profiles, loan applications, loan requests, chat messages, and support tickets; file storage is used for KYC and profile pictures. The **infrastructure layer** provides Node.js runtime, Express, Socket.io server, and deployment configuration (e.g., environment variables, optional Docker).

---

## III. LITERATURE SURVEY

### A. Peer-to-Peer Lending and Credit Scoring

Studies on P2P lending platforms emphasize the importance of transparent credit assessment and matching. Automated eligibility and scoring reduce information asymmetry between borrowers and lenders and can improve allocation of capital. The use of income-based ratios (such as FOIR and DTI) is well established in retail lending for determining affordability and default risk. InclusionNet adopts these principles in a rule-based form, with schema support for numeric credit scores to allow future integration of ML models.

### B. Digital Identity and KYC in Fintech

KYC (Know Your Customer) verification is essential for regulatory compliance and fraud prevention in lending. Document-based verification (e.g., Aadhaar, PAN in the Indian context) combined with admin review provides a balance between automation and control. InclusionNet implements a KYC workflow where borrowers and lenders upload documents and admins approve or reject, ensuring that only verified users can participate in lending and borrowing.

### C. Real-Time Communication in Platforms

Real-time chat improves user engagement and trust in P2P marketplaces. Socket.io and similar technologies enable instant messaging without full page reloads. InclusionNet integrates Socket.io for borrower–lender chat linked to loan requests, with support for read receipts and typing indicators, similar to modern messaging applications, thereby supporting negotiation and clarification during the lending process.

---

## IV. HARDWARE AND SOFTWARE REQUIREMENTS

### A. Hardware Requirements

1. **Processor:** Intel Core i5 (or equivalent) with at least 4 cores  
2. **RAM:** Minimum 8 GB (16 GB recommended)  
3. **Storage:** Minimum 10 GB free space (SSD recommended)  
4. **Network:** Wi-Fi 802.11ac / Ethernet for development and deployment  

### B. Software Requirements

1. **Operating System:** Windows 10/11 (64-bit), macOS 10.15+, or Linux (Ubuntu 20.04+)  
2. **Runtime:** Node.js 18+ (LTS recommended)  
3. **Frontend:** React 19+, Vite, Tailwind CSS, JavaScript/JSX  
4. **Backend:** Express 5.x (Node.js)  
5. **Database:** PostgreSQL 14+  
6. **ORM:** Prisma 7.x  
7. **Real-time:** Socket.io (server and client)  
8. **Auth:** JWT (e.g., jsonwebtoken), bcrypt for password hashing  
9. **File upload:** Multer; optional Cloudinary for cloud storage  
10. **Development:** VS Code or similar, npm or yarn  

---

## V. SOFTWARE REQUIREMENTS SPECIFICATION

### A. Users

- **Borrowers:** Individuals seeking loans; complete KYC, submit applications, view eligibility and matching lenders, send/receive loan requests, and chat with lenders.  
- **Lenders:** Individuals providing funds; complete KYC, set interest rate and available funds, browse matching loans, send/receive loan requests, and chat with borrowers.  
- **Administrators:** Platform operators; approve/reject KYC, review loan applications and add remarks, manage support tickets, and view platform analytics.

### B. Functional Requirements

1. **User Authentication:** The system shall allow users to register and log in securely using email and password with JWT token-based authentication. Role (BORROWER, LENDER, ADMIN) shall be assigned at registration. Only authenticated users shall access role-specific dashboards and features.  
2. **KYC Upload and Approval:** The system shall accept KYC document uploads (e.g., Aadhaar, PAN) for borrowers and lenders. Admins shall be able to approve or reject KYC. Only KYC-approved users shall be allowed to submit loan applications (borrowers) or offer funds (lenders).  
3. **Loan Application:** The system shall allow borrowers to submit loan applications with loan amount, purpose, and tenure. Applications shall be stored with status (PENDING, UNDER_REVIEW, APPROVED, REJECTED) and optional admin remarks.  
4. **Loan Eligibility:** The system shall compute maximum eligible loan amount using FOIR, existing EMI, tenure, and risk category. It shall display eligibility by tenure, DTI, risk level, and estimated EMI.  
5. **Matching Lenders:** The system shall return lenders who can fully fund a given loan application (available_funds ≥ loan amount), with optional filters (e.g., max interest rate). Match probability (e.g., high/medium/low) may be derived from funds relative to loan amount.  
6. **Matching Loans:** The system shall return PENDING loan applications that a lender can fully fund (loan amount ≤ available_funds), with optional filters (min credit score, tenure range).  
7. **Loan Requests:** The system shall allow borrowers to send funding requests to lenders and lenders to send funding offers to borrowers. Loan request status (PENDING, ACCEPTED, REJECTED, CANCELLED) shall be manageable by both parties.  
8. **Real-Time Chat:** The system shall provide a chat interface per loan request (or borrower–lender pair), with send/receive messages, read receipts, and typing indicators using Socket.io.  
9. **Dashboard Visualization:** The system shall display role-specific dashboards: borrower (eligibility, applications, matching lenders, requests, chat); lender (available funds, matching loans, requests, chat); admin (KYC queue, loan queue, support tickets).  
10. **Support Tickets:** The system shall allow users to create tickets with category and priority; admins shall view, reply, and update status.  
11. **Profile and Logout:** The system shall allow profile updates and profile picture upload. A secure logout option shall invalidate or discard the client-side token.

### C. Non-Functional Requirements

1. **Performance:** The system shall respond to typical API requests (eligibility, matching, chat) within acceptable latency (e.g., under 2 seconds for non-chat endpoints). Real-time messages shall be delivered with minimal delay.  
2. **Security:** Access shall be restricted by JWT and role. Passwords shall be hashed (e.g., bcrypt). File uploads shall be validated and stored securely.  
3. **Reliability:** The application shall handle validation errors and database errors gracefully and return appropriate HTTP status codes and messages.  
4. **Usability:** The UI shall be responsive (Tailwind CSS), with clear navigation and feedback for success and error states.  
5. **Scalability:** The architecture shall support multiple concurrent users; database indexing (e.g., on status, amount, tenure) shall be used for matching and listing.

---

## VI. IMPLEMENTATION

InclusionNet is implemented as a full-stack web application with a React (Vite) frontend and Express backend. The implementation follows a modular structure with clear separation between routes, controllers, middleware, and utilities.

**Eligibility:** The eligibility module uses `loanEligibility.js` with functions: `calculateMaxLoanAmount` (FOIR-based max EMI converted to loan amount via reverse EMI formula, with risk multipliers), `calculateDTI`, `getDTIRiskLevel`, and `calculateEMI`. Max loan is capped (e.g., ₹5,00,000). Risk category is derived from credit score (e.g., ≥750 Low, ≥650 Medium, else High) when available. The controller `getLoanEligibility` fetches the borrower profile, checks KYC, and returns eligibility for multiple tenures (e.g., 6–60 months).

**Matching:** The `loanMatching.js` module uses Prisma to query: (1) For a loan application: lenders with `available_funds >= loanAmount`, `kyc_status = approved`, with optional `maxInterestRate`; (2) For a lender: loan applications with `status = PENDING`, `loanAmount <= available_funds`, with optional `minCreditScore`, `minTenureMonths`, `maxTenureMonths`. Cursor-based pagination is used. Match score/probability is computed from available funds vs. loan amount (e.g., 1.5x → high, 1.2x → medium, else low).

**Backend:** Express app uses routes for auth, KYC, loans, loan requests, chat, user profile, and support. Middleware handles JWT verification, role checks, and file uploads (KYC, profile picture). Socket.io is mounted on the same server for real-time chat; events include message send, read receipt, and typing indicator.

**Frontend:** React Router defines public (landing, login, signup) and protected routes (dashboards, KYC, loans, matching, requests, chat, profile, support). Redux (or context) can store auth and user state. Dashboards consume APIs for eligibility, applications, matching lenders/loans, and chat; the chat UI connects to Socket.io for real-time updates.

**Database:** Prisma schema defines User, BorrowerProfile, LenderProfile, LoanApplication, LoanRequest, ChatMessage, SupportTicket, and SupportTicketReply with appropriate relations and indexes. Migrations are used for schema updates.

**Deployment:** Environment variables configure database URL, JWT secret, and optional file storage. The system can be run in development (e.g., `npm run dev` for frontend and backend) and production with process managers or containers.

---

## VII. RESULTS AND SCREENSHOTS

*(Placeholder: Insert screenshots here with captions.)*

- **Fig. 1.** Home / Landing Page  
- **Fig. 2.** Signup Page  
- **Fig. 3.** Login Page  
- **Fig. 4.** Borrower Dashboard (eligibility, applications, matching lenders)  
- **Fig. 5.** Lender Dashboard (matching loans, requests)  
- **Fig. 6.** Loan Application Form  
- **Fig. 7.** Matching Lenders / Matching Loans List  
- **Fig. 8.** Chat Interface  
- **Fig. 9.** Admin – KYC / Loan Review or Support Tickets  

---

## VIII. ACKNOWLEDGMENT / CONCLUSION

This project demonstrates a working Peer-to-Peer Lending Platform that integrates rule-based eligibility, intelligent matching, KYC workflow, and real-time chat to support financial inclusion. The system addresses limitations of manual, bank-centric processes by providing a single platform where borrowers and lenders can register, get verified, apply for or offer loans, and communicate in real time.

The implementation combines FOIR-based eligibility, Prisma-backed matching with filters, loan request lifecycle, and Socket.io-based chat in a unified stack. The modular architecture allows future enhancements such as ML-based credit scoring, integration with credit bureaus, payment gateway for disbursement and repayments, and mobile applications. InclusionNet contributes to the use of web and real-time technologies in fintech and demonstrates a scalable foundation for P2P lending in academic and practical contexts.

**Future work:** Integration with external credit bureaus or ML models for credit score; payment integration for disbursement and EMI collection; notifications (email/push) for status and messages; advanced analytics and reporting for admins; and optional mobile app (e.g., React Native).

---

## REFERENCES

[1] P2P Lending and financial inclusion – relevant academic or industry papers (add as per college format).  
[2] FOIR / DTI in retail lending – RBI or banking guidelines (add as per college format).  
[3] Socket.io or WebSocket-based real-time messaging – official docs or papers.  
[4] JWT and secure authentication in web applications.  
[5] Prisma ORM and PostgreSQL best practices.  
[6] React and Express security and performance practices.  

*(Replace [1]–[6] with actual references in the citation style required by your college.)*
