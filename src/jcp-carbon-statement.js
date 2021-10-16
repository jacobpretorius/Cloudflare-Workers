class ElementHandler {
  constructor(ecologiStats) {
    this.ecologiStats = ecologiStats
  }

  element(element) {
    // An incoming element
    if (element.getAttribute('id') === 'ecologi-trees') {
      element.setInnerContent(this.ecologiStats.TreesPlanted);
    }
    if (element.getAttribute('id') === 'ecologi-offset') {
      element.setInnerContent(this.ecologiStats.CarbonOffset);
    }
  }
}

const cacheKey = 'ecologi-stats';

async function handleRequest(request) {
  // Check if Ecologi Stats is in the KV cache
  let ecologiStats = await EcologiCache.get(cacheKey, {type: 'json'});
  if (ecologiStats === null) {
    // Get Azure Function
    const azureFunctionUrl = 'https://secret.azurewebsites.net/api/...';
    const ecologiResponse = await fetch(azureFunctionUrl);
    ecologiStats = await ecologiResponse.json();
    await EcologiCache.put(cacheKey, JSON.stringify(ecologiStats), {expirationTtl: 43200});
  }

  // Get page content
  const response = await fetch(request);

  // Return modified response
  return new HTMLRewriter()
    .on("span", new ElementHandler(ecologiStats)).transform(response);
}

addEventListener('fetch', event => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event.request));
})
