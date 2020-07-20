MetaEvidence display interface for Linguo disputes.

## Get Started

1. Clone this repo.
2. Run `yarn` to install dependencies
3. Run `yarn start` to start the dev server.

## Deploy

This interface is meant to be deployed to IPFS.
To do so, you should:

1. Copy the `.env.example` file to `.env`:
   ```sh
   cp .env.example .env
   ```
2. Set the appropriate environment variables.
3. Bundle the app for production:
   ```sh
   yarn build
   ```
4. Zip the `dist/` directory.
5. Send the zip file to Kleros IPFS host server through SSH (ask a team member if you are not sure how).
6. Unzip the file and jump to the folder.
7. Add the contents of the folder to IPFS:
   ```sh
   ipfs add -w -r .
   ```
8. The `evidenceDisplayURI` will be `/ipfs/<root_hash>`

## Other Scripts

- `yarn run lint:js` - Lint the entire project's .js files.
- `yarn run lint:js --fix` - Fixes linter errors entire project's .js files.
- `yarn run lint:css` - Lint the entire project's .css files.
- `yarn run lint:js --fix` - Fixes linter errors entire project's .css files.
- `yarn run lint` - Lint the entire project.
- `yarn run lint --fix` - Fixes linter errors in the entire project.
- `yarn run build` - Create a production build.
- `yarn run start` - Start the development server.
