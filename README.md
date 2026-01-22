# ecomdemo

## Project Name and Short Description

**ecomdemo**  
An ecom website to showcase integrations such as AWS, Salesforce Personalization, and AI.  
Built for testing and demonstrating Digital Commerce flows (category views, product views, add to cart, purchase) plus basic login/account behavior.  
Work in progress.

## Deploy

Install + build:
```bash
npm install
npm run build
npx cdk list
```

Deploy/Update Static Site Stack:
```bash
npx cdk synth EcomdemoStaticSiteStack
npx cdk deploy EcomdemoStaticSiteStack
```

Deploy/Update Catalog Stack:
```bash
npx cdk synth EcomdemoCatalogStack
npx cdk deploy EcomdemoCatalogStack
```

Note: In Path A, the catalog stack references DynamoDB tables by name that are currently created/owned by the static site stack.

Optional verification:
```bash
aws dynamodb describe-table --table-name EcomdemoStaticSiteStack-CatalogCategories --region <region>
aws cloudformation describe-stacks --stack-name EcomdemoCatalogStack --query "Stacks[0].Outputs[?OutputKey=='CatalogApiBaseUrl'].OutputValue" --output text
```

Verification (after EcomdemoCatalogStack deploy):
```bash
aws cloudformation describe-stacks --stack-name EcomdemoCatalogStack --query "Stacks[0].Outputs[?OutputKey=='CatalogApiBaseUrl'].OutputValue" --output text
```

```bash
curl "<API_BASE>/categories"
curl "<API_BASE>/products?categoryId=men"
curl "<API_BASE>/products/{productId}"
```

## Deploy

Install + build:
```bash
npm install
npm run build
npx cdk list
```

Deploy/Update Static Site Stack:
```bash
npx cdk synth EcomdemoStaticSiteStack
npx cdk deploy EcomdemoStaticSiteStack
```

Deploy/Update Catalog Stack:
```bash
npx cdk synth EcomdemoCatalogStack
npx cdk deploy EcomdemoCatalogStack
```

Note: In Path A, the catalog stack references DynamoDB tables by name that are currently created/owned by the static site stack.

Optional verification:
```bash
aws dynamodb describe-table --table-name EcomdemoStaticSiteStack-CatalogCategories --region <region>
aws cloudformation describe-stacks --stack-name EcomdemoCatalogStack --query "Stacks[0].Outputs[?OutputKey=='CatalogApiBaseUrl'].OutputValue" --output text
```
