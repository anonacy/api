// class tests {

//   // Get Aliases Route
//   static async getAliases() {
//     const aliases = await postalPuppet.getAliases({
//       puppetInstance
//     });
//     console.log(aliases);
//   }

//   static async getAddressEndpoints() {
//     // Add Alias Route
//     const endpoints = await postalPuppet.getAddressEndpoints({
//       puppetInstance
//     });
//     console.log(endpoints);
//   }

//   static async addAddressEnpoint() {
//     const addressEndpoint = await postalPuppet.addAddressEndpoint({
//       puppetInstance,
//       username,
//       domain
//     });
//     console.log(addressEndpoint.id);
//   }

//   // Add Alias Route
//   static async addAlias() {
//     const aliasRoute = await postalPuppet.addAlias({
//       puppetInstance,
//       alias: "random2@postal.anonacy.com",
//       endpoint: "hew@hiddenlogin.com",
//       endpoint_id: "be1bb0e3-35c4-4bdf-b5f9-e38b4ef3e7bd"
//     });
//     console.log(aliasRoute);
//   }

//   // Find Alias ID
//   static async findAliasID() {
//     const addressEndpointID = await postalPuppet.findAddressEndpointID({
//       puppetInstance,
//       username,
//       domain,
//       skipLoad: false
//     });
//     console.log("addressEndpointID: ", addressEndpointID.id);
//   }

//   // Find Route ID
//   static async findRouteID() {
//     const routeID = await postalPuppet.findAliasID({
//       puppetInstance,
//       username: "random1",
//       domain: "postalmail.anonacy.com"
//     });
//     console.log("routeID: ", routeID.id);
//   }
// }