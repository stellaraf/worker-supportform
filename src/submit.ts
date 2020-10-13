import querystring from 'querystring';

/**
 * Submit validated & parsed data to SFDC.
 */
export async function submitData(data: TFormData, userData: IUserData): Promise<Response> {
  // Destructure request JSON data & set defaults in case fields are not set.
  const {
    firstName = '',
    lastName = '',
    emailAddress: email = '',
    phoneNumber: phone = '',
    subject = '',
    details = '',
    companyName: company = '',
  } = data;

  // Initialize multi-line string for case comments, to which User Data will be added.
  let caseComment = `${details}
  `;

  // Add each User Data key & value to case comment.
  for (let [k, v] of Object.entries(userData)) {
    caseComment += `
    ${k}: ${v}`;
  }

  // Formulate an object conforming with SFDC field requirements.
  let formData: TSFDCRequest = {
    orgid: SITE_SFDC_ORG_ID,
    status: 'New',
    type: 'Request',
    name: [firstName, lastName].join(' '),
    company,
    email,
    phone,
    subject,
    description: details,
    ['00N3j00000FccHG']: caseComment,
  };

  // Add debug fields if in development environment.
  if (ENVIRONMENT === 'development') {
    formData = { debug: 1, debugEmail: 'matt@stellar.tech', ...formData };
  }

  /**
   * Construct the submission URL in query string formatting, to emulate generic HTML form
   * submission.
   */
  const submitUrl = `${SITE_FORM_SUBMIT_URL}?${querystring.stringify(formData)}`;
  return await fetch(submitUrl, { method: 'POST' });
}
