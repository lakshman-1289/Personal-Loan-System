# EZFINANZ Personal Loan System - Engineering & Implementation Workflow

**GitHub Repository**: [https://github.com/lakshman-1289/Personal-Loan-System](https://github.com/lakshman-1289/Personal-Loan-System)

---

## 1. Architectural Architecture & Design Patterns

The **EZFINANZ Personal Loan System** is designed from the ground up as a **Modular Monolith**. This architectural choice ensures high cohesion within functional modules while minimizing operational complexity during early-stage development, with a clean path to migrate to independent microservices when required.

```mermaid
flowchart TD
    subgraph Client [Next.js Client v15 / React v19]
        AuthCtx[Auth Context & State]
        UI[App Router Pages]
    end

    subgraph Backend [Spring Boot 3.x API / Java 21]
        Security[Spring Security & JWT Filter]
        
        subgraph AuthModule [Auth Module]
            AuthSvc[AuthService]
            TokenProv[JwtTokenProvider]
        end
        
        subgraph VerificationModule [Verification Module]
            VerifySvc[VerificationService]
            TwilioSvc[SmsServiceImpl]
            EmailSvc[EmailServiceImpl]
        end
        
        subgraph LoanModule [Loan Lifecycle Module]
            LoanSvc[LoanApplicationService]
            TermsSvc[LoanTermsService]
            BankSvc[BankDetailsService]
        end
        
        subgraph EligibilityModule [Eligibility Module]
            EligSvc[EligibilityService]
        end

        subgraph Storage [Storage Module]
            LocalStore[LocalStorageService]
        end
    end

    subgraph Database [MySQL 8 RDBMS]
        Tables[(EZFINANZ Tables)]
    end

    subgraph External [External APIs]
        TwilioAPI[Twilio Gateway]
    end

    UI --> AuthCtx
    AuthCtx -- JWT Header --> Security
    Security --> AuthModule & VerificationModule & LoanModule & EligibilityModule
    
    VerifySvc --> TwilioAPI
    VerifySvc --> Tables
    LoanSvc & TermsSvc & BankSvc & EligSvc --> Tables
    LocalStore --> Tables
```

### Core Architecture Principles:
1.  **Strict Modular Boundaries**: Business areas (Auth, Verification, KYC, Eligibility, Loan, Calculation) are separated by Java packages. Circular dependencies are avoided, and modules communicate via clear service interfaces.
2.  **Stateless Security**: Spring Security is configured to use token-based authentication using **JSON Web Tokens (JWT)**. Sessions are not persisted on the server (`SessionCreationPolicy.STATELESS`), allowing the backend to scale horizontally.
3.  **Interface Segregation**: Integrations (such as sending emails, SMS, or validating identity details) are abstracted behind Java interfaces. This allows switching between mock implementation classes (for local testing) and real providers (like Twilio SMS) using Spring profiles.

---

## 2. Database Schema & Relational Design

The database schema is mapped in **MySQL 8.x** via Hibernate/JPA. Primary keys are configured with auto-increment behavior, and index keys are created on foreign keys to optimize query performance.

```mermaid
erDiagram
    users ||--o{ verification_tokens : "has"
    users ||--o{ loan_applications : "applies"
    loan_applications ||--o{ kyc_details : "submits"
    loan_applications ||--o{ financial_details : "details"
    loan_applications ||--o{ eligibility_results : "evaluates"
    loan_applications ||--o{ loan_terms : "chooses"
    loan_applications ||--o{ bank_details : "provides"
    loan_applications ||--o{ declarations : "accepts"
    loan_applications ||--o{ repayment_installments : "generates"

    users {
        BIGINT id PK
        VARCHAR email UNIQUE
        VARCHAR phone UNIQUE
        VARCHAR password
        VARCHAR role
        BOOLEAN email_verified
        BOOLEAN phone_verified
        TIMESTAMP created_at
    }

    verification_tokens {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR token
        VARCHAR token_type
        TIMESTAMP expiry_date
        TIMESTAMP created_at
    }

    loan_applications {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP submitted_at
    }

    loan_terms {
        BIGINT id PK
        BIGINT application_id FK
        DECIMAL loan_amount
        INT tenure_months
        DECIMAL annual_interest_rate
        DECIMAL processing_fee
        DECIMAL gst
        DECIMAL emi
        DECIMAL total_interest
        DECIMAL total_repayment
        DECIMAL net_disbursement
        DECIMAL irr
    }

    repayment_installments {
        BIGINT id PK
        BIGINT loan_terms_id FK
        INT installment_number
        DATE due_date
        DECIMAL emi_amount
        DECIMAL principal_portion
        DECIMAL interest_portion
        DECIMAL remaining_balance
    }
```

### Strategic Mapping Rules Applied:
*   **Enum Representation**: Column mappings for states and types (such as `ApplicationStatus`, `VerificationTokenType`, `Role`, `Gender`, and `AccountType`) are declared with `@Enumerated(EnumType.STRING)`. This ensures they are saved as readable strings in MySQL, preventing database corruption if enum orders are modified in the source code.
*   **Temporal Precision**: Standard dates (like Date of Birth) are mapped with `@Column(name = "date_of_birth", columnDefinition = "DATE")`. Audit parameters use `@CreationTimestamp` and `@UpdateTimestamp` to maintain accurate write history automatically.
*   **Currency Representation**: All monetary columns utilize the Java `BigDecimal` type and map to MySQL `DECIMAL(18, 2)` to eliminate floating-point arithmetic errors.

---

## 3. Module-by-Module Engineering Implementation

### A. Authentication Module (`com.ezfinanz.auth`)
Provides login, registration, and user session management.
*   **JWT Token Lifecycle**: Upon successful login, [JwtTokenProvider.java](file:///c:/Users/Nithinkumar/Desktop/Lakshman%20Desktop/Personal-Loan-System/backend/src/main/java/com/ezfinanz/auth/util/JwtTokenProvider.java) encodes the user's ID, email, and security role into a JWT signed with a Base64-encoded secret key using the HMAC-SHA256 signature algorithm.
*   **Security Filter**: The [JwtAuthenticationFilter.java](file:///c:/Users/Nithinkumar/Desktop/Lakshman%20Desktop/Personal-Loan-System/backend/src/main/java/com/ezfinanz/auth/config/JwtAuthenticationFilter.java) runs on every request. It extracts the token from the `Authorization: Bearer <token>` HTTP header, validates its expiration and signature, and populates the `SecurityContextHolder` with standard Spring User Principal credentials.
*   **Database Seeding**: The [AdminUserInitializer.java](file:///c:/Users/Nithinkumar/Desktop/Lakshman%20Desktop/Personal-Loan-System/backend/src/main/java/com/ezfinanz/auth/config/AdminUserInitializer.java) implements `CommandLineRunner`. During startup, it checks the database for an admin role. If not present, it hashes a seed password via `BCryptPasswordEncoder` and inserts the default admin account:
    *   **Admin Email**: `admin@ezfinanz.com`
    *   **Admin Password**: `Admin@123`

### B. Contact Verification Module (`com.ezfinanz.verification`)
Secures phone and email channels using One-Time Passwords (OTPs).
*   **OTP Generation**: The system generates secure, 6-digit random codes:
    ```java
    String otp = String.format("%06d", new Random().nextInt(999999));
    ```
    Tokens are stored in the database with a 10-minute expiry date (`expiryDate = LocalDateTime.now().plusMinutes(10)`).
*   **SMS & Email Gateways**: 
    *   *Email*: Simulates email delivery by outputting SMTP payloads and code parameters to the logger logs.
    *   *SMS*: Integrates with the **Twilio SMS API**. The service [SmsServiceImpl.java](file:///c:/Users/Nithinkumar/Desktop/Lakshman%20Desktop/Personal-Loan-System/backend/src/main/java/com/ezfinanz/verification/service/SmsServiceImpl.java) instantiates a Twilio client and dispatches the OTP payload asynchronously:
        ```java
        Message.creator(
            new PhoneNumber(toPhone),
            new PhoneNumber(twilioFromNumber),
            "Your EZFINANZ OTP code is: " + otp
        ).create();
        ```
*   **Token Verification**: Upon submission, the service fetches the latest unused token. If the code matches and is not expired, the user account flags (`emailVerified` / `phoneVerified`) are set to true. The validated token is deleted from the database to prevent reuse.

### C. Loan Lifecycle State Machine (`com.ezfinanz.loan`)
Automates status transitions on the application resource.
*   **Initialization**: Calling `POST /api/v1/applications` creates a new loan application record. If the user has an active application, the request is rejected with a validation error.
*   **State Machine Transitions**:
    ```text
    [DRAFT / Created]
           │
           ▼
    [EMAIL_VERIFICATION] ──(Verify Email OTP)──► [PHONE_VERIFICATION]
                                                        │
                                                (Verify Phone OTP)
                                                        │
                                                        ▼
    [KYC_PENDING] ◄─────────────────────────────────────┘
    ```
    Verification services automatically update the application status as verification succeeds. For instance, verifying the email OTP advances the application status to `PHONE_VERIFICATION` and automatically fires the phone verification code.

### D. KYC & Underwriting Modules (`com.ezfinanz.kyc` & `com.ezfinanz.eligibility`)
Verifies user identities and evaluates financial risk.
*   **KYC Logging**: Stores official details (PAN, Address, Date of Birth, and Gender) in the `KycDetails` table. It utilizes a `StorageService` interface to upload verification files (like PDF copies of ID cards) to local directories.
*   **Eligibility Engine**: Implements the debt-to-income (DTI) check.
    $$\text{DTI} = \left( \frac{\text{Existing Monthly Debt Payments}}{\text{Gross Monthly Income}} \right) \times 100$$
    *Underwriting Criteria*:
    *   If Credit Score $\ge 750$ and DTI $\le 40\%$, the application status is set to `ELIGIBLE`.
    *   If Credit Score is between $650$ and $749$ and DTI $\le 45\%$, it is set to `PARTIALLY_ELIGIBLE` with a capped limit.
    *   If it falls below these parameters, the status is set to `NOT_ELIGIBLE` and the application is rejected.

### E. Financial Calculations Module
Implements amortization calculation rules.
*   **Equated Monthly Installment (EMI)**: Evaluates monthly repayments using the formula:
    $$\text{EMI} = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
    where $P$ is the principal, $r$ is the monthly interest rate (annual interest rate / 12), and $n$ is the tenure in months.
*   **Amortization Schedule Generation**: Iterates through the loan tenure to generate an array of `RepaymentInstallment` values.
    *   **Monthly Interest Portion**: $\text{Balance} \times r$
    *   **Monthly Principal Portion**: $\text{EMI} - \text{Interest Portion}$
    *   **Remaining Balance**: $\text{Balance} - \text{Principal Portion}$
    Calculations use `BigDecimal` scale formatting (`setScale(2, RoundingMode.HALF_EVEN)`) to ensure exact monetary divisions.
*   **Internal Rate of Return (IRR)**: Computes the true yield percentage of the loan considering upfront administrative fees.

---

## 4. Frontend Architecture & Routing (Next.js 15)

The frontend is built with **Next.js 15** and **React 19** using the App Router structure, styled with **Tailwind CSS v4**.

### Key Frontend Components:
1.  **State Management (`AuthContext.tsx`)**: Stores JWT authentication parameters in browser memory and local storage. It sets up an Axios request interceptor to automatically inject the bearer token into all API calls:
    ```typescript
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    ```
2.  **Protected Route Guards**: Wraps sensitive pages. If a session is missing or the role does not match, the guard redirects the client.
3.  **Onboarding Wizard Layout**: Uses a multi-step form wizard to guide the customer through the loan journey:
    *   `app/register/page.tsx` & `app/login/page.tsx`
    *   `app/verify/email/page.tsx` & `app/verify/phone/page.tsx`
    *   `app/apply/kyc/page.tsx`
    *   `app/apply/financials/page.tsx`
    *   `app/apply/eligibility/page.tsx`
    *   `app/apply/terms/page.tsx`
    *   `app/apply/bank/page.tsx`
    *   `app/apply/declarations/page.tsx`
    *   `app/apply/selfie/page.tsx`

---

## 5. Engineering Challenges & Resolutions

### Challenge 1: Lombok Compile Failure (Command Line vs IDE)
*   **Description**: Running tests from the terminal (`mvnw test`) failed with compilation errors stating that getters, setters, and builders were undefined. However, the project compiled and ran inside the IDE without issue.
*   **Resolution**: The IDE was using annotation processors dynamically, but it saved class files inside the shared `target/` directory without generating Lombok code. When Maven ran, it saw these class files as up-to-date and skipped recompilation. Running `.\mvnw.cmd clean test` deleted this target cache, forcing a clean compile that processed the Lombok annotations.

### Challenge 2: Next.js Port CORS Access Policy
*   **Description**: API calls from the client application running on `http://localhost:3000` to the server at `http://localhost:8080` were blocked by browser CORS policy, and the client could not read the `Authorization` header.
*   **Resolution**: Updated [SecurityConfig.java](file:///c:/Users/Nithinkumar/Desktop/Lakshman%20Desktop/Personal-Loan-System/backend/src/main/java/com/ezfinanz/auth/config/SecurityConfig.java) and implemented a custom `WebConfig` class to allow port 3000, specify allowed headers, and explicitly expose the `Authorization` header to the client:
    ```java
    configuration.setExposedHeaders(Arrays.asList("Authorization"));
    ```

### Challenge 3: MySQL Enum Index Synchronization Issues
*   **Description**: Modifying enum values in code caused database mismatch errors because JPA maps enums to integer indexes by default.
*   **Resolution**: Added the `@Enumerated(EnumType.STRING)` annotation to all entity enum fields. This stores enums as strings (e.g., `APPROVED` or `REJECTED`) in MySQL, making database schema updates safe.

---

## 6. How to Build & Run the System

### Step 1: Initialize Database
Start MySQL on port `3306` and create the schema:
```sql
CREATE DATABASE ezfinanz;
```

### Step 2: Boot Backend App
Open a terminal in the `backend/` folder and run:
```powershell
.\mvnw.cmd clean spring-boot:run
```
The server will start on port `8080` and seed the default admin account:
*   **Admin Email**: `admin@ezfinanz.com`
*   **Admin Password**: `Admin@123`

### Step 3: Run Frontend
Open a terminal in the `frontend/` folder and run:
```powershell
npm install
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser. You can register a new user, log in, verify email/phone using console logs, fill in your KYC details, and go through the entire personal loan workflow!
