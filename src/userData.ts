import { UAParser } from 'ua-parser-js';

/**
 * Test if every member of an array resolves to true.
 */
function all(...iter: any[]) {
  for (let i of iter) {
    if (!i) {
      return false;
    }
  }
  return true;
}

/**
 * Parse Cloudflare & User Agent headers to gather limited data about the submitter of the form.
 */
export async function buildUserData(request: Request): Promise<IUserData> {
  // Add Cloudflare data to the user data.
  const cfData = {
    ASN: request.cf.asn,
    Country: request.cf.country,
    'Cloudflare Origin': request.cf.colo,
  };

  // Parse the User Agent header
  const uaRaw = request.headers.get('User-Agent');
  const parser = new UAParser();
  parser.setUA(uaRaw);
  const { browser, device, os } = parser.getResult();

  let data: IUserData = {
    ...cfData,
  };
  if (typeof browser.name !== 'undefined') {
    // Add browser information if it exists.
    data.Browser = `${browser.name} ${browser.version}`;
  }
  if (typeof device.vendor !== 'undefined') {
    // Add device information if it exists.
    data.Device = `${device.vendor} ${device.model} ${device.type}`;
  }
  if (typeof os.name !== 'undefined') {
    // Add OS information if it exists.
    data.OS = `${os.name} ${os.version}`;
  }
  if (!all(...['Browser', 'Device', 'OS'].map(k => Object.keys(data).includes(k)))) {
    // If the browser, device, or OS aren't able to be parsed, provide the raw User Agent string.
    data['User Agent'] = uaRaw;
  }
  return data;
}
