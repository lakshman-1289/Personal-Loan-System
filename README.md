# EZFINANZ Personal Loan System

I am building a **Personal Loan Application System** using **Spring Boot and React**.

The goal of this project is to build a complete online loan application process where a customer can apply for a personal loan and an admin can review, approve, reject, and process the application.

                               EZFINANZ

             ┌─────────┴─────────┐
             │                                                  |
         CUSTOMER                             ADMIN
             │                                                 │
       Apply for loan                        Review loan
             │                                                 │
             └─────────┬─────────┘
                                       │
                               Spring Boot
                                       │
                                   MySQL

## Customer Flow

The customer will go through the following steps:

1. Sign up / Log in
2. Verify email and phone number
3. Complete KYC details
4. Enter financial details
5. Check loan eligibility
6. Select loan amount and repayment tenure
7. View EMI, interest, charges, and repayment details
8. Add bank account details
9. Accept the required declaration
10. Submit a selfie/photo for verification
11. Track the application status

## Admin Flow

The admin will be able to:

1. Log in to the admin dashboard
2. View all loan applications
3. View the complete details of an application
4. Check customer verification and KYC details
5. Review eligibility and loan details
6. Review the submitted selfie/photo
7. Approve or reject the selfie
8. Complete the final loan/disbursement process

## Backend

The backend will be developed using **Spring Boot**.

I will build the backend as a **modular monolith** initially. Each business area will have its own module with a clear responsibility.

Main modules:

```text
Authentication
Customer
Verification
KYC
Eligibility
Loan Application
EMI & IRR Calculation
Bank Account
Declaration
Selfie Verification
Admin
Disbursement
```

The modules will be kept independent as much as possible so that specific modules can be separated into microservices in the future if the application requires it.

## Frontend

The frontend will be developed using:

* React
* Vite
* Axios
* Tailwind CSS

The frontend will have separate flows for **customers and admins**.

## Database

I will use **MySQL** with **Spring Data JPA / Hibernate**.

The database will store information related to:

* Users and roles
* Loan applications
* KYC details
* Eligibility results
* Loan terms
* Bank account details
* Declarations
* Selfie/photo verification
* Disbursement
* Application status

## Security

The application will use **Spring Security** for authentication and authorization.

Security features will include:

* JWT authentication
* Password hashing
* Role-based authorization
* Input validation
* Protected customer and admin APIs
* Secure handling of sensitive information

The main roles will be:

```text
CUSTOMER
ADMIN
```

## Loan Eligibility

The eligibility system will evaluate the customer's financial information and determine whether the customer is:

```text
ELIGIBLE
PARTIALLY_ELIGIBLE
NOT_ELIGIBLE
```

The eligibility calculation can consider factors such as:

* Credit score
* Monthly / annual income
* Existing debts
* Debt-to-income ratio
* Requested loan amount

## Loan Calculation

The system will calculate and display the loan details based on the selected loan amount, interest rate, and repayment tenure.

The calculation will include:

* EMI
* Total interest
* Total repayment amount
* Processing fee
* GST
* Other applicable charges
* Total charges
* Net disbursement amount
* IRR

The customer should be able to change the loan amount or tenure and get the updated calculation.

## External Services

External services such as:

* Email verification
* SMS / OTP
* Credit score checking
* KYC verification
* Bank verification

will initially be **mocked/simulated** so that the complete application can be developed and tested without depending on real third-party services.

These integrations will be designed using interfaces so that real providers can be added later.

## Application Status

The loan application will maintain its current stage throughout the process.

Example:

```text
DRAFT
  ↓
EMAIL_VERIFICATION
  ↓
PHONE_VERIFICATION
  ↓
KYC
  ↓
ELIGIBILITY
  ↓
LOAN_TERMS
  ↓
BANK_ACCOUNT
  ↓
DECLARATION
  ↓
SELFIE_VERIFICATION
  ↓
ADMIN_REVIEW
  ↓
APPROVED / REJECTED
  ↓
DISBURSEMENT
```

This status will be used by both the customer and admin dashboards to understand the current stage of the application.

## Project Status

🚧 **Development Started**

I am starting the development step by step, beginning with the **Spring Boot backend, MySQL database, authentication, and the core loan application flow**.

The project will be developed incrementally, with the architecture and modules being improved as new features are implemented.
