export const BRANDS = [
    {
        name: 'State Bank of India',
        tokens: ['sbi', 'yono', 'onlinesbi', 'sbicard'],
        domains: ['sbi.co.in', 'onlinesbi.sbi', 'sbicard.com', 'sbi.bank.in', 'bank.sbi'],
    },
    { name: 'HDFC Bank', tokens: ['hdfc', 'hdfcbank'], domains: ['hdfcbank.com', 'hdfcbank.in'] },
    { name: 'ICICI Bank', tokens: ['icici', 'icicibank'], domains: ['icicibank.com', 'icicibank.co.in'] },
    { name: 'Axis Bank', tokens: ['axis', 'axisbank'], domains: ['axisbank.com', 'axisbank.co.in'] },
    { name: 'Kotak Mahindra Bank', tokens: ['kotak'], domains: ['kotak.com'] },
    { name: 'Punjab National Bank', tokens: ['pnb', 'pnbindia'], domains: ['pnbindia.in', 'netpnb.com'] },

    { name: 'Bank of Baroda', tokens: ['bankofbaroda'], domains: ['bankofbaroda.in', 'bobibanking.com'] },
    { name: 'Canara Bank', tokens: ['canara', 'canarabank'], domains: ['canarabank.com', 'canarabank.in'] },
    { name: 'Union Bank of India', tokens: ['unionbank'], domains: ['unionbankofindia.co.in'] },
    { name: 'IDFC First Bank', tokens: ['idfc'], domains: ['idfcfirstbank.com'] },  
    { name: 'Yes Bank', tokens: ['yesbank'], domains: ['yesbank.in'] },
    { name: 'IndusInd Bank', tokens: ['indusind'], domains: ['indusind.com'] },

    { name: 'Paytm', tokens: ['paytm'], domains: ['paytm.com', 'paytmbank.com', 'paytm.in'] },
    { name: 'PhonePe', tokens: ['phonepe'], domains: ['phonepe.com'] },
    { name: 'Google Pay', tokens: ['gpay', 'googlepay'], domains: ['pay.google.com', 'google.com'] },

    { name: 'BHIM / NPCI', tokens: ['bhim', 'npci'], domains: ['npci.org.in', 'bhimupi.org.in'] },
    { name: 'Razorpay', tokens: ['razorpay'], domains: ['razorpay.com'] },

    { name: 'Reserve Bank of India', tokens: ['rbi'], domains: ['rbi.org.in'] },
    { name: 'UIDAI / Aadhaar', tokens: ['uidai', 'aadhaar', 'aadhar'], domains: ['uidai.gov.in'] },
    { name: 'Income Tax Department', tokens: ['incometax', 'itr'], domains: ['incometax.gov.in', 'incometaxindia.gov.in'] },
    { name: 'EPFO', tokens: ['epfo', 'epfindia'], domains: ['epfindia.gov.in'] },
    { name: 'GST', tokens: ['gst', 'gstn'], domains: ['gst.gov.in'] },
    { name: 'DigiLocker', tokens: ['digilocker'], domains: ['digilocker.gov.in'] },
    { name: 'Cybercrime portal', tokens: ['cybercrime'], domains: ['cybercrime.gov.in'] },
    { name: 'IRCTC', tokens: ['irctc'], domains: ['irctc.co.in', 'irctc.com'] },
    { name: 'India Post', tokens: ['indiapost'], domains: ['indiapost.gov.in'] },
    { name: 'TRAI', tokens: ['trai'], domains: ['trai.gov.in'] },

    { name: 'Amazon', tokens: ['amazon'], domains: ['amazon.in', 'amazon.com'] },
    { name: 'Flipkart', tokens: ['flipkart'], domains: ['flipkart.com'] },  
    { name: 'Myntra', tokens: ['myntra'], domains: ['myntra.com'] },
    { name: 'FedEx', tokens: ['fedex'], domains: ['fedex.com'] },  
    { name: 'DHL', tokens: ['dhl'], domains: ['dhl.com', 'dhl.co.in'] },
    { name: 'Blue Dart', tokens: ['bluedart'], domains: ['bluedart.com'] }, 
    { name: 'Delhivery', tokens: ['delhivery'], domains: ['delhivery.com'] },

    { name: 'Netflix', tokens: ['netflix'], domains: ['netflix.com'] },
    { name: 'WhatsApp', tokens: ['whatsapp'], domains: ['whatsapp.com'] },
    { name: 'Jio', tokens: ['jio'], domains: ['jio.com', 'jio.in'] },
    { name: 'Airtel', tokens: ['airtel'], domains: ['airtel.in', 'airtel.com'] },
];

export const OFFICIAL_DOMAINS = new Set(BRANDS.flatMap((b) => b.domains));

export const MULTI_SUFFIXES = [
    'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in', 'gov.in', 'nic.in',
    'ac.in', 'edu.in', 'res.in', 'mil.in',
    'co.uk', 'org.uk', 'ac.uk', 'com.au', 'co.jp', 'com.sg', 'com.br',
];

export const RISKY_TLDS = new Set([
    'xyz', 'top', 'click', 'buzz', 'tk', 'ml', 'ga', 'cf', 'gq', 'rest', 'icu',
    'info', 'online', 'site', 'live', 'shop', 'link', 'work', 'fit', 'loan',
    'monster', 'cyou', 'sbs', 'lol', 'quest', 'bar', 'autos', 'cam', 'pw',
]);

export const SHORTENERS = new Set([
    'bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'cutt.ly', 'is.gd', 'shorturl.at',
    'rebrand.ly', 'ow.ly', 'buff.ly', 'shorte.st', 'adf.ly', 'tiny.cc', 'bl.ink',
]);

export const FREEMAIL = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in',
    'outlook.com', 'hotmail.com', 'live.com', 'rediffmail.com', 'aol.com',
    'protonmail.com', 'proton.me', 'zoho.com', 'mail.com', 'gmx.com', 'yandex.com',
    'icloud.com', 'me.com',
]);

export const CONFUSABLES = {
    а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', х: 'x', у: 'y', ѕ: 's', і: 'i',
    ј: 'j', ԁ: 'd', ɡ: 'g', ʟ: 'l', м: 'm', н: 'h', т: 't', в: 'b', к: 'k',
    α: 'a', ο: 'o', ρ: 'p', ε: 'e', ι: 'i', ν: 'v', κ: 'k', η: 'n', τ: 't',
};
