import { postalPuppet } from '../src';
import { useRuntimeConfig } from './config';
import { Utils } from '../src/utils';

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
const { username, domain } = Utils.decomposeEmail(newEmail);

try {

  // Get Aliases list
  // const aliases = await postalPuppet.getAliases({
  //   puppetInstance
  // });
  // console.log(aliases);

  // Add Enpoints list
  // const endpoints = await postalPuppet.getAddressEndpoints({
  //   puppetInstance
  // });
  // console.log(endpoints);

  // disable an alias
  const disableThisAlias = "reject@postalmail.anonacy.com";
  console.log("Disabling alias: ", disableThisAlias);
  const disable = await postalPuppet.disableAlias({
    puppetInstance,
    alias: disableThisAlias
  });
  console.log(disable);

  // const addressEndpoint = await postalPuppet.addAddressEndpoint({
  //   puppetInstance,
  //   username,
  //   domain
  // });
  // console.log(addressEndpoint.id);

  // Add Alias Route
  // const aliasRoute = await postalPuppet.addAlias({
  //   puppetInstance, 
  //   alias: "bounce@postalmail.anonacy.com",
  //   endpoint: "hew@hiddenlogin.com"
  // });
  // console.log(aliasRoute);

  // Find Endpoint ID
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

//* Add Domain
// const domain = await postalPuppet.addDomain(
//   puppetInstance,
//   tempVars.orgId,
//   tempVars.orgPublicId,
//   tempVars.domainName
// );
// console.log(domain);


