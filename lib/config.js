export const SERVICES = ['DLT', 'RCS', 'WhatsApp'];

export const PENDING_OPTIONS = {
  DLT: { 'DLT Document': 'DLT Document' },
  RCS: {
    'Logo': 'Logo',
    'Banner': 'Banner',
    'Website': 'Website',
    'Other Document': 'Other Document',
  },
  WhatsApp: {
    'Facebook/Meta Access': 'Facebook/Meta Access',
    'Document': 'Document',
    'Website': 'Website',
    'Phone Number': 'Phone Number',
  },
};

export const WEBSITE_OPTIONS = {
  'Copyright': 'Website Copyright',
  'Terms & Conditions': 'Terms & Conditions',
  'Privacy Policy': 'Privacy Policy',
  'Contact Us + Opt-in': 'Contact Us + Opt-in',
  'Website Update': 'Website Update',
};

export function allOptions(service) {
  return { ...(PENDING_OPTIONS[service] || {}), ...WEBSITE_OPTIONS };
}

export function buildMessage(c) {
  const map = allOptions(c.service);
  const labels = c.pending_items.map((k) => map[k] || k);
  const list =
    labels.length > 1
      ? labels.slice(0, -1).join(', ') + ' aur ' + labels[labels.length - 1]
      : labels[0] || 'details';
  return `Dear Client, ${c.company} ka ${c.service} service ke liye ${list} abhi pending hai. Kindly share the required details to proceed.`;
}
