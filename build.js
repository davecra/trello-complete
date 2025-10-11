const fs = require('fs');
// Read the base_build value from package.json
const packageJsonPath = './package.json';
const packageJson = require(packageJsonPath);
const baseBuildVersion = packageJson.base_build;
const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });
const dateParts = currentDate.split('/');

const year = dateParts[2];
const month = dateParts[0].padStart(2, '0');
const day = dateParts[1].padStart(2, '0');

const formattedDate = `${year}${month}${day}`;

// get and increment build number
const buildNumber = getBuildNumber(packageJson, formattedDate);

// Update the version with the base build version and the build number
const updatedVersion = `${baseBuildVersion}.${formattedDate}.${buildNumber}`;

// Update the package.json file
updatePackageJson(packageJsonPath, packageJson, updatedVersion, buildNumber);

/**
 * Retrieves the current build number from package.json or resets it if the date has changed
 * @param {object} packageJson - The package.json object
 * @param {string} currentDate - Current date string
 * @returns {number} The updated build number
 */
function getBuildNumber(packageJson, currentDate) {
  const version = packageJson.version;
  const versionParts = version.split('.');
  const storedDate = versionParts[3];
  const storedBuildNumber = versionParts[4];
  console.log(`Last daily build is: ${storedBuildNumber}`);

  if (storedDate === currentDate) {
    return parseInt(storedBuildNumber) + 1;
  } else {
    return 1;
  }
}

/**
 * Updates the package.json file with the new version and build number
 * @param {string} packageJsonPath - Path to the package.json file
 * @param {object} packageJson - The package.json object
 * @param {string} version - Updated version string
 * @param {number} buildNumber - Updated build number
 */
function updatePackageJson(packageJsonPath, packageJson, version, buildNumber) {
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated version to ${version}`);
  console.log(`Updated build number to ${buildNumber}`);
}
