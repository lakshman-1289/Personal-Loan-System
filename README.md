# EZFINANZ Personal Loan System

I am building a **Personal Loan Application System** using **Spring Boot and React**.

The main goal of this project is to create a complete loan application flow where a customer can apply for a personal loan online and an admin can review and process the application.

## What I am going to build

### Customer Side

The customer will be able to:

1. Sign up and log in
2. Verify email and phone number
3. Complete KYC details
4. Enter financial details and check loan eligibility
5. Select loan amount and EMI tenure
6. View EMI, interest, charges and repayment details
7. Add a bank account
8. Accept the loan declaration
9. Upload a live selfie/photo
10. Track the loan application status

### Admin Side

The admin will be able to:

1. Log in to the admin dashboard
2. View all loan applications
3. View the complete details of an application
4. Review the customer's KYC and eligibility information
5. Review the submitted selfie/photo
6. Approve or reject the selfie
7. Complete the final loan/disbursement process

## Backend

The backend will be developed using **Spring Boot**.

I will organize the backend into separate modules such as:

```text
Authentication
Customer
KYC
Eligibility
Loan
EMI Calculation
Bank Account
Declaration
Selfie Verification
Admin
Disbursement
```

For the initial implementation, I will build this as a **modular monolith** rather than creating multiple microservices. The modules will have clear responsibilities so that they can be separated into microservices later if required.

## Frontend

The frontend will be developed using:

* React
* Vite
* Axios
* Tailwind CSS

It will provide separate experiences for customers and admins.

## Database

I will use **PostgreSQL** to store:

* User information
* Loan applications
* KYC details
* Eligibility results
* Loan terms
* Bank account details
* Declaration details
* Selfie information
* Disbursement information

## Security

The application will use:

* Spring Security
* JWT authentication
* Password hashing
* Role-based authorization

There will be two main roles:

```text
CUSTOMER
ADMIN
```

## External Services

For this project, services such as:

* Email verification
* SMS/OTP
* Credit score
* KYC verification
* Bank verification

can initially be **mocked/simulated** so that the complete application can work without depending on real third-party services.

## Project Status

🚧 **Development Started**

I will build the project step by step, starting with the Spring Boot backend, database, authentication and the core loan application workflow.
