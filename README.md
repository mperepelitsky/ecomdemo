# ecomdemo

## Project Name and Short Description

**ecomdemo**  
Built for fun and to try various integrations with Salesforce, AWS, and others
A shopping site featuring a variety of products, designed for testing and demonstration of Digital Commerce (DC) and other SDK events.
Simulates category views, product views, add to cart and purchase.
Ability to log in and simple account page view and manipulation.
All values and items is tracked in the datalayer for now.
\*\*Potential future improvements to have a more realistic and more complex features.

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/mperepelitsky/ecomdemo.git
   ```
2. Navigate into the project directory:
   ```bash
   cd ecomdemo
   ```
3. (Optional) Install project dependencies if a package manager is used (e.g., npm or yarn):
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## Usage Examples

- Start the application (if using a standard web server setup or static hosting):
  - Open the `index.html` file in your browser.
  - Or deploy to a static hosting service.
- If there are scripts for starting a local development server, run:
  ```bash
  npm start
  ```
  or
  ```bash
  yarn start
  ```

## Technologies Used

- **JavaScript**
- **HTML**
- **CSS (Tailwind)**
- **LocalStorage for demo data persistence**

## Demo Features

- Product catalog with categories (Men's, Women's, Accessories)
- User authentication and registration
- Shopping cart functionality
- Order history tracking
- Responsive design
- Data layer tracking for analytics

**Note**: This application is now branded as VibeThread throughout the codebase.

## Infrastructure (AWS CDK)

This repo includes a CDK app that creates an S3 + CloudFront static site with ACM + Route53.

Deploy:

```bash
cd infra
npm install
npx cdk deploy -c domainName=shop.mikesdemos.com -c hostedZoneDomain=mikesdemos.com
```

Upload the site content after deploy (replace the bucket name from stack outputs):

```bash
aws s3 sync . s3://YOUR_BUCKET_NAME --delete --exclude "infra/*" --exclude ".git/*" --exclude "node_modules/*"
```

Notes:

- The ACM certificate is created in us-east-1 for CloudFront.
- S3 is private; CloudFront uses OAC for access.
