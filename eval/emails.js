export const PHISH_EMAILS = [
   {
      id: 'e-01',
      from: 'State Bank of India <sbi.security.team@gmail.com>',
      subject: 'URGENT: Your account will be suspended',
      body: 'Dear Customer, your KYC verification has failed. Please confirm your account details by clicking the link below within 24 hours to avoid suspension. http://sbi-kyc-verify.online-update.in/login',
      why: 'freemail + brand + phishing link',
   },
   {
      id: 'e-02',
      from: 'HDFC Bank <alerts@hdfcbank-secure.com>',
      subject: 'Action required: unusual login detected',
      body: 'We detected a login from a new device. Verify your account immediately here: https://hdfcbank.com.secure-login.xyz/in/netbanking',
      why: 'lookalike sender + phishing link',
   },
   {
      id: 'e-03',
      from: 'Income Tax Department <refunds@incometax-gov.in>',
      replyTo: 'collect@refund-desk.top',
      subject: 'Your refund of Rs.15,490 is pending',
      body: 'Your income tax refund could not be processed. Update your bank account details here to receive the credit: http://incometax-refund.gov-verify.in/claim',
      why: 'fake gov domain + reply-to mismatch',
   },
   {
      id: 'e-04',
      from: 'Accounts Payable <finance@suppliers-invoice.info>',
      subject: 'Updated bank details for invoice 44120',
      body: 'Please note our bank account details have changed. Kindly remit the outstanding payment to the new account provided in the attached invoice. Confirm once transferred.',
      why: 'business email compromise',
   },
   {
      id: 'e-05', 
      from: 'Amazon <no-reply@amazon-in-orders.buzz>',
      subject: 'Your order has been placed - Rs.84,990',
      body: 'An order for an iPhone was placed on your account. If this was not you, cancel it immediately by logging in here: https://amazon.in.offers-bigbillion.buzz/deal',
      why: 'lookalike sender + phishing link',
   },
   {
      id: 'e-06',
      from: 'UIDAI <aadhaar.update@rediffmail.com>',
      subject: 'Aadhaar suspension notice',
      body: 'Your Aadhaar will be deactivated as biometric verification is pending. Update now: https://uidai-aadhaar.verify-now.org/update',
      why: 'freemail claiming UIDAI',
   },
   {
      id: 'e-07',
      from: 'IT Helpdesk <it-support@yourcompany-hr.online>',
      subject: 'Mailbox storage full - action required',
      body: 'Your mailbox is full and outgoing mail is blocked. Confirm your password here to restore access: http://update-kyc.secure-bank-in.xyz/form.php',
      why: 'credential harvest',
   },
   {
      id: 'e-08',
      from: 'Ramesh Kumar <ramesh.kumar@gmail.com>',
      replyTo: 'payments@vendor-settlement.site',
      subject: 'Re: pending payment',
      body: 'Hi, as discussed please transfer the amount to our new account details. The old account is closed. Attached is the revised invoice.',
      why: 'reply-to mismatch + bank detail change',
   },
   {
      id: 'e-09',   
      from: 'Netflix <billing@netfIix-billing.update-pay.site>',
      subject: 'Payment failed - update your details',
      body: 'We could not process your payment. Please update your card details to continue your membership: http://netfIix-billing.update-pay.site/renew',
      why: 'homoglyph sender + link',
   },
   {
      id: 'e-10',
      from: 'Courier Services <delivery@dhl-in-customs.delivery-pay.info>',
      subject: 'Customs duty pending on your parcel',
      body: 'Your package is held at customs. A duty of Rs.1,850 is unpaid. Clear now to avoid return to sender: https://dhl-in-customs.delivery-pay.info/clear',
      why: 'courier phishing',
   },
   {
      id: 'e-11',
      from: 'HR Department <hr@company-payroll.work>',
      subject: 'Salary revision letter attached',
      body: 'Please find attached your revised salary structure. Open the attachment salary_revision.apk on your phone to view it.',
      why: 'malicious attachment',
   }, 
   {
      id: 'e-12',
      from: 'admin@paytm.com <notifications@rewards-claim.top>',
      subject: 'You have won a cashback of Rs.10,000',
      body: 'Congratulations! Claim your cashback within 3 hours: http://paytm-cashback.rewards-claim.top/win',
      why: 'display-name spoof + prize scam',
   },
];

export const GENUINE_EMAILS = [
   {
      id: 'ge-01',
      from: 'HDFC Bank <alerts@hdfcbank.com>',
      subject: 'Transaction alert on your account',
      body: 'Rs.2,499.00 was debited from your account ending 4471 on 30-07-26. If you did not authorise this, call 1800 202 6161. HDFC Bank will never ask for your OTP, PIN or CVV.', 
      why: 'real bank alert',
   },
   {
      id: 'ge-02',
      from: 'Income Tax Department <donotreply@incometax.gov.in>',
      subject: 'ITR processed for AY 2026-27',
      body: 'Your return has been processed. Any refund will be credited to the bank account validated on the e-filing portal at https://incometax.gov.in/iec/foportal/. No action is required from you.',
      why: 'real gov mail mentioning refund',
   },
   {
      id: 'ge-03',
      from: 'Amazon.in <shipment-tracking@amazon.in>',  
      subject: 'Your order has been delivered',
      body: 'Your package was delivered on 31 July. View your order history at https://www.amazon.in/gp/css/order-history. Rate your experience in the app.',
      why: 'real delivery mail',
   },  
   { 
      id: 'ge-04',
      from: 'State Bank of India <alerts@sbi.co.in>',
      subject: 'Periodic KYC update due',
      body: 'Your periodic KYC update is due. Please visit your nearest branch with original identity proof before 30 September. We will never ask for your details over email, phone or SMS.',
      why: 'real KYC mail — the hardest negative',
   },
   {
      id: 'ge-05',
      from: 'IRCTC <ticketadmin@irctc.co.in>',
      subject: 'Booking confirmed - PNR 4412889021',
      body: 'Your ticket is confirmed. Manage your booking at https://www.irctc.co.in/nget/train-search. Carry a valid photo ID while travelling.',  
      why: 'real ticket confirmation',
   },
   {
      id: 'ge-06',
      from: 'DigiLocker <noreply@digilocker.gov.in>', 
      subject: 'Your driving licence is now available',
      body: 'Your driving licence has been issued to your DigiLocker account. Sign in at https://digilocker.gov.in/signin to download it. No fee is payable for the digital copy.',
      why: 'real gov mail with a signin link',
   },
   {
      id: 'ge-07',
      from: 'Priya Nair <priya.nair@gmail.com>',
      subject: 'Dinner on Saturday?',
      body: 'Hey, are we still on for dinner at 8 on Saturday? I booked the table near the window. Let me know if that still works.',
      why: 'ordinary personal mail from freemail',
   },
   {
      id: 'ge-08',
      from: 'Netflix <info@netflix.com>',
      subject: 'Your plan renews on 5 August', 
      body: 'Your membership renews on 05-08-26 for Rs.649. You can change or cancel your plan any time in Account settings at https://www.netflix.com/in/.',
      why: 'real subscription mail',
   },
   {
      id: 'ge-09',
      from: 'Accounts <accounts@bluedart.com>',
      subject: 'Invoice 88231190 for July shipments',
      body: 'Please find your monthly invoice attached as a PDF. Payment terms are unchanged at 30 days. Contact your account manager with any queries.',
      why: 'real invoice, unchanged details',  
   },
   {
      id: 'ge-10',
      from: 'The Ken <newsletter@the-ken.com>',
      subject: 'Why Indian fintech is consolidating',
      body: 'In todays edition we look at consolidation across Indian payments companies, and what it means for UPI economics. Read online or manage your subscription preferences.',
      why: 'newsletter from an unfamiliar domain',
   },
   {
      id: 'ge-11',
      from: 'Fortis Healthcare <appointments@fortishealthcare.com>',
      subject: 'Appointment reminder - Dr Menon, 11:30 AM',
      body: 'This is a reminder for your appointment tomorrow at 11:30 AM. Please arrive 15 minutes early. Reply RESCHEDULE if you need a different slot.',  
      why: 'real appointment reminder',
   },
   {
      id: 'ge-12',
      from: 'Security Awareness <security@yourcompany.com>',
      subject: 'Phishing awareness: what to watch for',
      body: 'Fraudsters often claim your Aadhaar is linked to a crime, ask you to install AnyDesk, or tell you not to disconnect the call. No bank will ever ask for your OTP. Report such messages to 1930 or cybercrime.gov.in.',
      why: 'awareness mail quoting the scam script',
   },
];  
