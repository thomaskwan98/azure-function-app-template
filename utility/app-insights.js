/*
* @author PwC-Fung Szeto
* @created 20231016
* @reference https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs
*/

let appInsights = require("applicationinsights");
try {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
} catch (err) {
  console.log("Application Insight fails to start: " + err);
}
