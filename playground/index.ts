import { postalPuppet } from '../src';
import { useRuntimeConfig } from './config';

const config = useRuntimeConfig();

console.time('⏱️ Time to run');
const { puppetInstance } = await postalPuppet.initPuppet({
  postalControlPanel: config.postalControlPanel,
  postalUrl: config.postalUrl,
  postalUser: config.postalUser,
  postalPass: config.postalPass
});
if (!puppetInstance) throw new Error(`Failed to initialize puppet:`);

const newEmail = "hew+5@hiddenlogin.com";
// const { username, domain } = Utils.decomposeEmail(newEmail);

try {

  // Get Aliases list
  // const aliases = await postalPuppet.getAliases({
  //   puppetInstance
  // });
  // console.log(aliases);

  // Get Endpoints list
  // const endpoints = await postalPuppet.getAddressEndpoints({
  //   puppetInstance
  // });
  // console.log(endpoints);

  // const addressEndpoint = await postalPuppet.addAddressEndpoint({
  //   puppetInstance,
  //   username,
  //   domain
  // });
  // console.log(addressEndpoint.id);

  // Add Alias Route
  // const aliasRoute = await postalPuppet.addAlias({
  //   puppetInstance, 
  //   alias: "random3@postalmail.anonacy.com",
  //   endpoint: "hew@hiddenlogin.com"
  // });
  // console.log(aliasRoute);

    // disable an alias
  // const disableThisAlias = "reject@postalmail.anonacy.com";
  // console.log("Disabling alias: ", disableThisAlias);
  // const disable = await postalPuppet.disableAlias({
  //   puppetInstance,
  //   alias: disableThisAlias
  // });
  // console.log(disable);

  // enable an alias
  // const enableThisAlias = "random2@postalmail.anonacy.com";
  // const enableThisEndpoint = "hew@hiddenlogin.com";
  // console.log("Enable alias: ", enableThisAlias, " with endpoint: ", enableThisEndpoint);
  // const enable = await postalPuppet.enableAlias({
  //   puppetInstance,
  //   alias: enableThisAlias,
  //   endpoint: enableThisEndpoint
  // });
  // console.log(enable);

  // Delete Alias Route
  // const didDeleteAlias = await postalPuppet.deleteAlias({
  //   puppetInstance, 
  //   alias: "random3@postalmail.anonacy.com"
  // });
  // console.log(didDeleteAlias);

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
