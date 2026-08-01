export const SCENARIOS = [
    {
        id: 'digital-arrest',
        name: 'Digital Arrest', 
        subtitle: 'The full playbook — impersonation to extraction',
        caller: '+91 91XXXX0142',
        callerLabel: 'Unknown • Delhi',
        expected: 'critical',
        lines: [
            { s: 'caller', t: 'Good afternoon sir. Am I speaking with Mr. Sharma?', d: 2600 },
            { s: 'you', t: 'Yes, speaking. Who is this?', d: 2000 },
            {
                s: 'caller',
                t: 'Sir, I am calling from the Mumbai Cyber Crime branch. My name is Inspector Rakesh Verma, badge number 4471.',
                d: 4200,
            },
            {
                s: 'caller',
                t: 'A parcel has been intercepted at the international courier facility. It was booked in your name and it contained banned narcotic substances and four expired passports.',
                d: 5200,
            },
            { s: 'you', t: 'What? I have not sent any parcel.', d: 2200 },
            {
                s: 'caller',
                t: 'Sir, your Aadhaar number is linked to this case. An FIR has been registered against you, case number 2026 stroke 118, under money laundering provisions.',
                d: 5400,
            },
            {
                s: 'caller',
                t: 'This is a non-bailable offence. As of now you are under digital arrest and you are in our custody.',
                d: 4400,
            },
            {
                s: 'caller',
                t: 'Do not disconnect this call under any circumstances. You must stay on the line for the duration of the investigation.',
                d: 4600,
            },
            {
                s: 'caller',
                t: 'This is a confidential matter under the Official Secrets Act. Do not tell anyone. Do not inform your family or your wife.', 
                d: 4800,
            },
            {
                s: 'caller',
                t: 'Please go and sit alone in a separate room and lock the door. Is anyone else there with you right now?',
                d: 4400,
            },
            { s: 'you', t: 'No, no, I am alone now. Sir please, I have done nothing.', d: 2800 },
            {
                s: 'caller',
                t: 'We are now connecting you to a virtual court hearing on Skype. Turn on your camera and keep your camera on at all times.',
                d: 4800,
            },
            {
                s: 'caller',
                t: 'For verification the senior officer needs your total savings and fixed deposit balance. Tell me your bank account balance.',  
                d: 4800,  
            },
            { s: 'you', t: 'It is around eighteen lakh rupees.', d: 2200 },
            {
                s: 'caller',
                t: 'Sir, to prove these funds are clean you must transfer the amount to an RBI verification account for clearance.',
                d: 4800,  
            },
            {
                s: 'caller',   
                t: 'It is fully refundable within 24 hours once you are cleared. Do the transfer immediately or we will arrest you within 2 hours.',
                d: 5000,
            },
            { 
                s: 'caller',
                t: 'Write down this account number and make the UPI transfer now. Do not cut the call while doing it.',
                d: 4400,
            },
        ],
    },

    {
        id: 'remote-access',
        name: 'Remote Access / KYC',
        subtitle: 'Bank impersonation with screen takeover',
        caller: '+91 88XXXX9903',
        callerLabel: 'Unknown • Kolkata',

        expected: 'critical',
        lines: [
            {
                s: 'caller',
                t: 'Hello sir, I am calling from the RBI authorised KYC verification department.',
                d: 3400,
            },
            {
                s: 'caller',
                t: 'Your account will be blocked today because your KYC update has failed. Last warning.',
                d: 3800,  
            },
            { s: 'you', t: 'I updated my KYC last month at the branch.', d: 2400 },  
            {
                s: 'caller',
                t: 'Sir the system has not received it. Please install AnyDesk from the Play Store so I can complete it for you.',
                d: 4600,
            },
            {
                s: 'caller',
                t: 'Now share your screen with me and open your net banking application.',
                d: 3600,
            },
            {
                s: 'caller',
                t: 'A one time password has been sent to your number. Please read out the OTP to me for verification.',
                d: 4400,
            },
            {
                s: 'caller',
                t: 'There is also a small processing fee of 4,999 rupees to be paid immediately. It is refundable.',
                d: 4200, 
            },
        ],
    },

    {
        id: 'legit-bank',
        name: 'Genuine Bank Call',
        subtitle: 'Control case — Prahari must stay silent',
        caller: '+91 1800 XXX 4477',
        callerLabel: 'HDFC Bank • Verified',
        expected: 'safe', 
        lines: [
            {
                s: 'caller',
                t: "Good morning, this is Priya calling from your bank's fraud monitoring team.",
                d: 3400,
            },
            {
                s: 'caller',
                t: 'We noticed a card transaction of 42,000 rupees in Dubai this morning and wanted to check whether it was you.',
                d: 4600,
            },
            { s: 'you', t: 'No, that was definitely not me.', d: 2000 },
            {
                s: 'caller',
                t: 'Thank you. I have blocked the card as a precaution. We will never ask for your OTP, PIN or password on this call.',
                d: 4800,
            },
            {
                s: 'caller',
                t: 'No action is required from you right now. A replacement card will reach you in three working days.',
                d: 4400,
            },
            {
                s: 'caller',
                t: 'If you would like to confirm this conversation is genuine, please call us back on the number printed on the back of your card, or visit your nearest branch.',  
                d: 5400,
            },
            {
                s: 'caller', 
                t: 'Take your time, there is no rush. You can also discuss this with your family before doing anything.',
                d: 4400,
            }, 
        ],
    },
];

export const SAMPLE_MESSAGES = [
    { 
        id: 'courier',
        label: 'Courier scam',
        from: '+91 70XXXX2210',
        text:
            'FedEx: Your parcel bearing AWB 774120983 has been seized by Customs, Mumbai for containing illegal items. An FIR is being registered against your Aadhaar. Contact Cyber Cell officer immediately on +91 70XXXX2210 to avoid arrest. Do not ignore.',
    },
    {  
        id: 'kyc',  
        label: 'KYC / account block',
        from: 'VM-SBIBNK',
        text:
            'Dear Customer, your SBI YONO account will be BLOCKED today as your PAN-KYC is not updated. Update now to avoid deactivation: http://sbi-kyc-verify.online-update.in/login  — SBI',
    },
    {
        id: 'electricity',
        label: 'Electricity disconnection',
        from: '+91 63XXXX8817',
        text:
            'Dear Consumer, your electricity will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately contact our officer 63XXXX8817. -Electricity Board',
    },
    {
        id: 'genuine',
        label: 'Genuine bank alert',
        from: 'AD-HDFCBK',
        text:
            'Rs.2,499.00 debited from a/c XX4471 on 30-07-26 to AMAZON RETAIL. Not you? Report at 1800 202 6161. HDFC Bank will never ask for your OTP/PIN/CVV.',
    },
];
