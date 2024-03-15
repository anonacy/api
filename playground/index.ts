import { postalPuppet } from '../src';
import { useRuntimeConfig } from './config';

const delaySeconds = 0;

const config = useRuntimeConfig();

const tempVars = {
  orgId: 'anonacy',
  orgPublicId: 'anonacy',
  defaultPoolId: 'ip_pool_2',
  domainName: 'postal.anonacy.com',
  domainPostalId: '544db0b9-9d84-401f-86a2-469697261521',
  mailServerId: 'm74negvx9jxg150x',
  mailBridgeUrl: 'https://mail.bridge.uninbox.dev'
};

console.time('⏱️ Time to run');
const { puppetInstance } = await postalPuppet.initPuppet({
  postalControlPanel: config.postalControlPanel,
  postalUrl: config.postalUrl,
  postalUser: config.postalUser,
  postalPass: config.postalPass
});
if (!puppetInstance) throw new Error(`Failed to initialize puppet:`);

const newEmail = "hew+5@hiddenlogin.com";
let [username, domain] = newEmail.split('@');

// Add Address Endpoint
try {
  const addressEndpoint = await postalPuppet.addAddressEndpoint({
    puppetInstance,
    username,
    domain
  });
  console.log(addressEndpoint.id);

  // Add Alias Route
  // const aliasRoute = await postalPuppet.addAliasRoute({
  //   puppetInstance,
  //   username: "random1",
  //   domain: "postal.anonacy.com",
  //   endpoint: "hew@hiddenlogin.com",
  //   endpoint_id: "be1bb0e3-35c4-4bdf-b5f9-e38b4ef3e7bd"
  // });
  // console.log(aliasRoute);

  // Find Alias ID
  // const addressEndpointID = await postalPuppet.findAddressEndpointID({
  //   puppetInstance,
  //   username,
  //   domain,
  //   skipLoad: false
  // });
  // console.log("addressEndpointID: ", addressEndpointID.id);


  // Find Alias ID
  // const routeID = await postalPuppet.findAliasID({
  //   puppetInstance,
  //   username: "random1",
  //   domain: "postalmail.anonacy.com"
  // });
  // console.log("routeID: ", routeID.id);




  // console.log('⏱️ Delaying...');
  // await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));

} catch (error) {
  console.error(error);
}

await postalPuppet.closePuppet(puppetInstance);
console.timeEnd('⏱️ Time to run');

//* Create Org
// const org = await postalPuppet.createOrg(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId
// );
// console.log(org);

//* Set OrgIP Pools
// const ipPools = await postalPuppet.setOrgIpPools(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.defaultPoolId
// );
// console.log(ipPools);

//* Add Domain
// const domain = await postalPuppet.addDomain(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.domainName
// );
// console.log(domain);

// //* Add Mail Server
// const mailServer = await postalPuppet.addMailServer(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   tempVars.defaultPoolId
// );
// console.log(mailServer);

//* Set mail server config
// const mailServerConfig = await postalPuppet.setMailServerConfig(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   30,
//   10,
//   7,
//   7,
//   256
// );
// console.log(mailServerConfig);

//* Set Mailserver event Webhook
// const mailServerEventWebhooks = await postalPuppet.setMailServerEventWebhooks(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   tempVars.mailBridgeUrl
// );
// console.log(mailServerEventWebhooks);

//* Set mail server API key
// const mailServerApiKey = await postalPuppet.setMailServerApiKey(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId
// );
// console.log(mailServerApiKey);

//* Set mail server SMTP key
// const mailServerSmtpKey = await postalPuppet.setMailServerSmtpKey(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId
// );
// console.log(mailServerSmtpKey);

//* Set the servers httpEndpoint to mailbridge
// const mailServerRoutingHttpEndpoint = await postalPuppet.setMailServerRoutingHttpEndpoint(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   tempVars.mailBridgeUrl
// );
// console.log(mailServerRoutingHttpEndpoint);

//! * Set the mail server routes
// const mailServerRoute = await postalPuppet.setMailServerRoute(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   tempVars.mailBridgeUrl
// );
// console.log(mailServerRoute);

//* Set the mail server route for domain
// const mailServerRoute = await postalPuppet.setMailServerRouteForDomain(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.mailServerId,
//   tempVars.domainName
// );
// console.log(mailServerRoute);


