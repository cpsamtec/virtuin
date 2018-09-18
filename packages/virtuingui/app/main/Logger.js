// @flow
import { CloudLogger } from 'cloudlogging';

const groupName = "virtuingui";
const streamName = process.env.VIRT_STATION_NAME || "Invalid_No_VIRT_STATION_NAME"; //VIRT_STATION_NAME should be globally set on the computer
const logger = new CloudLogger(groupName);
logger.enableCloudwatch = false; // at first just use console transport
(async () => {
  await logger.open(streamName);
})();

export async function reconfigureLogger() {
  const awsRegion = process.env.AWS_REGION || 'us-east-2';
  const virtAwsLogGroup = process.env.VIRT_AWS_LOG_GROUP || null;
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || null;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY || null;
  const isDevelopment = process.env.NODE_ENV === 'development';
  let {open, error} = logger.status();
  if (open) {
    await logger.close();
  }
  if(!isDevelopment && virtAwsLogGroup && process.env.VIRT_STATION_NAME && awsAccessKeyId && awsSecretKey) {
    logger.enableCloudwatch = true;
    logger = new CloudLogger(virtAwsLogGroup);
  } else {
    logger.enableCloudwatch = false;
  }
  await logger.open(process.env.VIRT_STATION_NAME)
  logger.setRootMeta({station: process.env.VIRT_STATION_NAME})
}
export default logger;
