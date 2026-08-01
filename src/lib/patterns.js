export const STAGES = {
   contact: {
      id: 'contact',
      order: 1, 
      label: 'Authority Impersonation',
      hi: 'नकली अधिकारी',
      blurb: 'Caller claims to be police, CBI, ED, TRAI, customs or a bank official.',
   },
   fear: {
      id: 'fear',
      order: 2,
      label: 'Fear Induction',
      hi: 'डर पैदा करना',
      blurb: 'Manufactured legal jeopardy — warrants, money laundering, non-bailable offences.',  
   },
   isolation: {
      id: 'isolation', 
      order: 3,
      label: 'Isolation', 
      hi: 'अलग-थलग करना',
      blurb: 'Victim is cut off from family and independent advice. The single strongest signal.',
   },
   control: {
      id: 'control',
      order: 4,
      label: 'Control & Surveillance',
      hi: 'निगरानी',
      blurb: 'Video "custody", screen sharing, or remote-access software installation.',
   },
   extraction: {
      id: 'extraction',
      order: 5,
      label: 'Money Extraction',
      hi: 'पैसे की माँग',
      blurb: 'The ask — transfer funds to "verify", "secure" or "refundable deposit" accounts.',
   },
};

export const STAGE_ORDER = ['contact', 'fear', 'isolation', 'control', 'extraction'];

export const PATTERNS = [

   {
      id: 'auth-agency',
      stage: 'contact',
      weight: 14,
      label: 'Claims to be a law-enforcement agency',  
      why: 'Real CBI, ED, Narcotics or Cyber Crime officers do not open investigations over a phone call. They serve notice in person or in writing.',
      tests: [
         /\b(cbi|c\.b\.i)\b/i,
         /\benforcement directorate\b|\b\bED officer\b/i,
         /\bnarcotics (control )?(bureau|department)\b/i,
         /\b(cyber\s?crime|cyber cell)\b.{0,25}\b(branch|department|division|officer|police)\b/i,
         /\b(mumbai|delhi|kolkata|chennai|bengaluru|hyderabad)\s+(police|crime branch)\b/i,
         /\bcrime branch\b/i,
         /\bcustoms (department|officer)\b/i,
         /\btrai\b|\btelecom regulatory\b/i,
         /सीबीआई|प्रवर्तन निदेशालय|साइबर\s?क्राइम|क्राइम ब्रांच/,
      ], 
   },
   {
      id: 'auth-rank',
      stage: 'contact', 
      weight: 8,
      label: 'Asserts a police rank or badge number',
      why: 'Scripted rank + badge number is used to manufacture authority early in the call. Verify any officer independently on the official department line.',
      tests: [
         /\b(inspector|sub[- ]inspector|dcp|acp|commissioner|ips officer|head constable)\b/i,
         /\bbadge (number|no|id)\b/i,
         /\bmy (name is|id is)\b.{0,30}\b(officer|inspector)\b/i,

         /\b(i am|this is|speaking is)\b.{0,20}\b(a |an )?(police officer|investigating officer|senior officer)\b/i,
         /\bइंस्पेक्टर\b|\bअधिकारी\b.{0,20}\bबोल रहा\b/,  
      ],
   },
   {
      id: 'auth-rbi',
      stage: 'contact',
      weight: 12,
      label: 'Claims to represent RBI or a regulator',  
      why: 'The Reserve Bank of India never contacts individual citizens about their accounts, and never holds "verification" accounts.',
      tests: [
         /\b(rbi|reserve bank)\b/i,
         /\bfrom the (income tax|gst) department\b/i,
         /\bआरबीआई|रिज़र्व बैंक/,
      ],
   },
   {
      id: 'auth-aadhaar',
      stage: 'contact',
      weight: 15,
      label: 'Links your Aadhaar / PAN to a crime',
      why: 'The single most common opening line in digital arrest scams. Your Aadhaar number cannot be "linked to a case" — it is not how criminal investigations work.',
      tests: [
         /\baadhaa?r\b.{0,60}\b(crime|case|criminal|money laundering|fraud|illegal|fir|linked|misuse)\b/i,
         /\b(crime|case|criminal|money laundering|fir)\b.{0,60}\baadhaa?r\b/i,
         /\bpan card\b.{0,50}\b(crime|case|laundering|fraud|illegal)\b/i,
         /\byour (sim|number|mobile number)\b.{0,50}\b(illegal|crime|fraud|misuse|case)\b/i,
         /आधार.{0,50}(अपराध|केस|मामल|मनी लॉन्ड्रिंग|गैरकानूनी)/,
      ],
   },

   {
      id: 'fear-arrest',
      stage: 'fear',
      weight: 20,

      floor: 72,
      label: 'Threat of arrest or "digital arrest"',
      why: '"Digital arrest" does not exist in Indian law. No agency can place you under arrest over a phone or video call. This phrase alone is proof of fraud.',
      tests: [
         /\bdigital(ly)? arrest(ed)?\b/i,
         /\bunder arrest\b/i,
         /\barrest warrant\b|\bwarrant (has been )?issued\b/i,
         /\bnon[- ]bailable\b/i,
         /\bwe will arrest you\b|\byou will be arrested\b/i,
         /\bcustody\b.{0,30}\b(virtual|online|video|digital)\b/i,
         /डिजिटल अरेस्ट|गिरफ्तार|वारंट|गैर[- ]?जमानती/,
      ],
   },
   {
      id: 'fear-laundering',
      stage: 'fear',
      weight: 14,
      label: 'Accusation of money laundering or trafficking',
      why: 'Serious-sounding accusations are used to overwhelm judgement. Genuine cases arrive as written notice, never as a surprise call.',
      tests: [
         /\bmoney laundering\b/i,
         /\b(drug|narcotic|mdma|ketamine)s?\b.{0,80}\b(parcel|courier|package|consignment|shipment)\b/i,
         /\b(parcel|courier|package|consignment|shipment)\b.{0,90}\b(drug|narcotic|illegal|passport|banned|seized|intercepted)\b/i,
         /\bhuman trafficking\b/i,
         /\bterror(ist)? funding\b/i,
         /\byour (name|account) (is )?(involved|implicated)\b/i,
         /मनी लॉन्ड्रिंग|ड्रग्स|तस्करी/,
      ],
   },
   {
      id: 'fear-case',
      stage: 'fear',  
      weight: 9,  
      label: 'Quotes a fake FIR or case number',
      why: 'A recited case number sounds official but is unverifiable on the call. Check any FIR yourself at the police station or on the state police portal.',
      tests: [
         /\bfir\b.{0,25}\b(number|no|registered|lodged|filed)\b/i,
         /\bcase (number|no|id)\b.{0,20}\d/i,
         /\bcomplaint (has been )?(registered|filed)\b.{0,30}\b(against you|in your name)\b/i,
         /\bएफआईआर|मुकदमा दर्ज/,
      ],
   },
   {
      id: 'fear-urgency',
      stage: 'fear',
      weight: 10,
      label: 'Artificial deadline pressure',
      why: 'Urgency exists to stop you thinking or checking. No legitimate legal process collapses if you take an hour to verify it.',
      tests: [
         /\bwithin (the next )?\d+\s?(minute|hour)s?\b/i,
         /\b(immediately|right now|at once)\b.{0,40}\b(transfer|pay|deposit|settle|clear)\b/i,
         /\bif you (don'?t|do not)\b.{0,50}\b(arrest|jail|freeze|seize|block)\b/i,
         /\blast (warning|chance)\b/i,
         /\bतुरंत\b.{0,30}(पैसे|भुगतान|ट्रांसफर)/,
      ],
   },

   {
      id: 'iso-forbid-disconnect',
      stage: 'isolation',
      weight: 22,

      floor: 62,
      label: 'Forbids you from disconnecting the call',
      why: 'No investigating officer requires you to stay on a call. This exists purely to stop you from getting a second opinion. Hang up now.',
      tests: [
         /\b(do not|do n'?t|don'?t|never|cannot|can not|must not|should not|may not)\b.{0,25}\b(disconnect|hang up|cut (the )?call|end (the |this )?call)\b/i,
         /\bmust (stay|remain)\b.{0,30}\b(line|call|video|connected)\b/i,
         /\bif you (disconnect|hang up|end (the|this) call)\b/i,
         /\bkeep (the |this )?(call|video|camera) (on|connected|running)\b/i,   
         /\b(24|twenty[- ]four) hours?\b.{0,30}\b(surveillance|monitoring|call|camera)\b/i,  
         /\bकॉल (मत|नहीं) काट/, 
         /\bफोन मत रखना\b/,
         /\bcall (disconnect|cut) mat k/i,
      ],
   },
   {
      id: 'iso-stay-on-line',
      stage: 'isolation',
      weight: 10,

      label: 'Asks you to stay on the line',
      why: 'Ordinary on its own — support staff say it all the time. It only matters alongside the other signals on this call.',
      tests: [/\bstay on (the )?(line|call|video)\b/i, /\bline pe rahiye\b/i],
   },
   {
      id: 'iso-secrecy',
      stage: 'isolation',
      weight: 21,
      label: 'Orders you to tell no one',
      why: 'Secrecy is the scam\'s survival mechanism. Every family member you tell is a chance for the fraud to be caught. Tell someone immediately.',
      tests: [
         /\b(do not|don'?t)\b.{0,30}\b(tell|inform|discuss|talk to|contact|call|phone|ring|speak to|involve)\b.{0,35}\b(anyone|anybody|any ?one else|family|wife|husband|son|daughter|friend|neighbour|neighbor|relatives|mummy|mommy|papa|mother|father|parents)\b/i,  
         /\b(this is|it is|keep (it|this))\s+(a\s+)?confidential\b/i,
         /\badvise against (involving|telling|informing)\b/i,
         /\bकिसी को (मत|नहीं) बताना\b/,
         /\bकिसी को मत बताइए\b/,
         /\bगोपनीय\b/,
         /\bkisi ko (mat|nahi) bata/i,
      ],
   },
   {
      id: 'iso-secrecy-legal',
      stage: 'isolation',
      weight: 24,

      floor: 68,
      label: 'Claims secrecy law forbids you from telling anyone',
      why: 'The Official Secrets Act does not apply to you, and no investigation can legally stop you telling your own family. This exists only to keep you isolated.', 
      tests: [
         /\bofficial secrets act\b/i,
         /\byou are (legally )?bound\b.{0,35}\b(not to|secrecy|confidential)\b/i,
         /\bbreaking confidentiality\b/i,
         /\blegally bound not to\b/i,
      ], 
   },
   {
      id: 'iso-alone',
      stage: 'isolation',
      weight: 16,
      label: 'Instructs you to move somewhere alone',
      why: 'Being isolated in a room removes the one thing that reliably stops this scam — another person overhearing it.',
      tests: [  
         /\b(go|move|sit)\b.{0,25}\b(alone|a (separate|closed|private) room|somewhere private)\b/i,
         /\block the door\b/i,
         /\bis (anyone|somebody) (there |else )?(with you|at home|in the room)\b/i,
         /\bare you alone\b/i,
         /\bअकेले\b.{0,25}(कमरे|जाओ|चले जाइए)/,
      ],
   },

   {
      id: 'ctrl-remote-app',
      stage: 'control',
      weight: 20,

      floor: 72,
      label: 'Asks you to install remote-access software',
      why: 'AnyDesk, TeamViewer and similar apps hand a stranger full control of your phone, including your banking apps. No official body will ever ask for this.', 
      tests: [  
         /\banydesk\b/i,
         /\bteam ?viewer\b/i,
         /\bquick ?support\b/i,
         /\brust ?desk\b/i,
         /\bairdroid\b/i,
         /\bscreen ?(share|sharing|mirroring)\b/i,
         /\binstall\b.{0,35}\b(app|application)\b.{0,45}\b(play store|link|apk|whatsapp|i am sending|sending you)\b/i,
         /\b(app|application)\b.{0,30}\b(bhej|भेज)\b.{0,40}\b(install|download)\b/i,
         /\b(install|download)\b.{0,25}\bkar(ke|iye|na)\b/i,
         /\bshare your screen\b/i,
         /\btake control\b.{0,25}\b(remotely|of your (phone|device|computer|screen))\b/i,
         /\blet me (see|control|access)\b.{0,30}\byour (screen|phone|device)\b/i,
         /\baccess code\b.{0,30}\b(give|tell|share|send)\b|\b(give|tell|share|send)\b.{0,30}\baccess code\b/i,
         /\bस्क्रीन शेयर\b/,
      ],
   },
   {
      id: 'ctrl-video-custody',
      stage: 'control',
      weight: 17,
      label: 'Demands a continuous video call / fake courtroom',
      why: 'Fake "virtual courtrooms" with uniformed actors and police backdrops are staged over Skype or WhatsApp video. Indian courts never operate this way.',
      tests: [
         /\b(skype|whatsapp|video) (call|hearing|interrogation)\b.{0,40}\b(court|magistrate|judge|officer|hearing|statement)\b/i,
         /\b(virtual|online|video) (court|courtroom|hearing|trial|magistrate)\b/i,
         /\bturn on your camera\b/i,
         /\bkeep your camera on\b/i,
         /\bवीडियो कॉल\b.{0,30}(अदालत|कोर्ट|मजिस्ट्रेट)/,  
      ],
   },
   {
      id: 'ctrl-otp',
      stage: 'control',
      weight: 19,

      floor: 78,
      label: 'Asks for an OTP, PIN, CVV or password',
      why: 'No bank, police force or government body ever asks for an OTP. Anyone who does is committing fraud, without exception.',
      tests: [
         /\b(otp|one time password)\b.{0,40}\b(share|tell|give|send|read|forward)\b/i,
         /\b(share|tell|give|send|read out)\b.{0,30}\b(otp|one time password|pin|cvv|password|passcode)\b/i,
         /\bwhat is the (otp|code)\b/i,
         /\bओटीपी\b.{0,25}(बताइए|भेजिए|शेयर)/,
      ],
   },
   {
      id: 'ctrl-verify-details',
      stage: 'control',
      weight: 11,
      label: 'Harvests your personal or bank details',
      why: 'Collecting your account balance and holdings tells the scammer exactly how much to demand.',
      tests: [
         /\b(tell|confirm|verify|share)\b.{0,30}\b(bank (account|balance)|account number|net ?banking|credit card|debit card)\b/i,
         /\bhow much (money |balance )?(do you have|is in your account)\b/i,
         /\btotal (savings|deposits?|fd|fixed deposits?)\b/i,
         /\b(tell|confirm|share)\b.{0,35}\b(savings|fixed deposits?|assets|holdings)\b/i,
         /\bconfirm your assets\b/i,
         /\bबैंक (खाता|बैलेंस)\b.{0,25}(बताइए|कितना)/,
      ],
   },

   {
      id: 'ext-verify-transfer',
      stage: 'extraction',
      weight: 25,

      floor: 75,  
      label: 'Demands a transfer to "verify" or "clear" your funds',
      why: 'There is no such thing as a verification account. This is the moment your money leaves permanently — and it is the reason the last twenty minutes of the call happened.',
      tests: [  
         /\btransfer\b.{0,50}\b(verify|verification|clear|clearance|check|validate|secure|safe custody)\b/i,
         /\b(verify|verification|clearance)\b.{0,40}\b(account|amount|fund|money|deposit)\b/i,
         /\brbi (account|verification)\b/i,
         /\bgovernment (verified |escrow )?account\b/i,
         /\bsupreme court account\b/i,
         /\bmove your (money|funds|savings)\b.{0,40}\b(safe|secure|our|this) account\b/i,
         /\b(पैसे|रकम)\b.{0,40}(ट्रांसफर|जमा).{0,30}(जाँच|सत्यापन|वेरिफ)/,
      ],
   },
   {
      id: 'ext-refundable',
      stage: 'extraction',
      weight: 18,  
      label: 'Promises the money is "refundable"',
      why: '"Fully refundable within 24 hours" is the standard closing line. Nothing is ever refunded.',
      tests: [
         /\brefund(able|ed)\b.{0,40}\b(within|after|once|immediately|24)\b/i,
         /\byou will get (it|your money) back\b/i,
         /\bमें वापस मिल जाएगा\b/,
      ],
   },
   {
      id: 'ext-fine',
      stage: 'extraction',  
      weight: 16,
      label: 'Demands a fine, bail or settlement payment', 
      why: 'Fines and bail are never collected over the phone, by UPI, or into a personal account.',
      tests: [
         /\b(pay|deposit|settle)\b.{0,35}\b(fine|penalty|bail|settlement|security deposit|processing fee)\b/i,
         /\b(fine|penalty|bail amount)\b.{0,30}\b(of|is|rs|rupees|₹|lakh|crore)\b/i,
         /\bजुर्माना|जमानत राशि/,
      ],  
   },
   {  
      id: 'ext-channel',
      stage: 'extraction',
      weight: 14,
      label: 'Names an untraceable payment channel',
      why: 'UPI to a personal handle, crypto, or gift cards are chosen because the money cannot be recalled once sent.',
      tests: [
         /\b(upi|imps|neft|rtgs)\b.{0,40}\b(transfer|send|now|immediately|this (id|number))\b/i,
         /\b(bitcoin|usdt|crypto|binance)\b/i,
         /\b(google play|amazon|gift) (card|voucher)s?\b/i,
         /\bwrite down (this|the) account number\b/i,
      ],
   },

   {
      id: 'ext-advance-fee',
      stage: 'extraction',
      weight: 22,
      floor: 62,
      label: 'Wants a payment before releasing money to you',
      why: 'Advance-fee fraud, and the shape of almost every prize, job and investment scam: your money is always one more payment away. Legitimate winnings, refunds and salaries never require you to pay first.',
      tests: [
         /\b(pay|deposit|transfer|submit|clear|settle)\b.{0,70}\b(to|before|and then|so that)\b.{0,25}\b(release|unlock|withdraw|receive|claim|credit|process)\b/i,
         /\b(processing|registration|conversion|clearance|customs|security|activation|membership|handling)\s+(fee|charge|charges|amount)\b/i,
         /\b(tds|gst|income tax)\b.{0,50}\b(pay|deposit|clear)\b.{0,40}\b(withdraw|release|credit)\b/i,
         /\b(withdraw|withdrawal)\b.{0,40}\b(you must|first|pehle)\b.{0,30}\b(pay|deposit|jama)\b/i,
         /\b(pehle|पहले)\b.{0,30}\b(fee|charge|paise|रकम)\b.{0,25}\b(jama|जमा)\b/i,
         /\b(registration|processing|advance)\b.{0,25}\b(ke liye|के लिए)\b.{0,30}\b(rupaye|rupees|rs|₹|\d{3,})\b/i,
         /\b(jama|जमा)\s+(kar|करें|karein|kijiye)\b.{0,45}\b(wapas|वापस|refund|return)\b/i,
         /\brefundable\b.{0,45}\b(registration|processing|security|deposit|fee)\b/i,
         /\b(fee|charge|deposit) of (rs\.?|₹)\s?[\d,]+\b.{0,45}\b(confirm|release|unlock|claim|start)\b/i,
      ],
   }, 
   {
      id: 'ext-pin-to-receive',
      stage: 'extraction',
      weight: 26,
      floor: 80,
      label: 'Asks you to enter your PIN to *receive* money',
      why: 'A UPI PIN is never required to receive money — only to send it. Anyone telling you to approve a request or enter your PIN to get a refund is taking money out of your account, not putting it in.',
      tests: [
         /\b(enter|put in|use|type)\b.{0,35}\b(upi\s+)?(pin|secret number|passcode)\b.{0,45}\b(receive|accept|credit|get|money|refund|amount)\b/i,
         /\b(approve|accept|authorise|authorize)\b.{0,35}\b(the |this |a )?(collect )?request\b.{0,45}\b(pin|receive|refund|money)\b/i,
         /\bcollect request\b/i,
         /\b(scan|scanning)\b.{0,25}\bqr\b.{0,45}\b(receive|get|refund|advance)\b/i,
      ],
   },
   {
      id: 'job-earning-scheme',
      stage: 'contact',
      weight: 17,
      label: 'Unrealistic work-from-home earnings offer',
      why: 'Task and rating "jobs" open with easy daily income and end with you depositing money to unlock earnings that do not exist.',
      tests: [
         /\b(work from home|part[- ]time job|घर बैठे|ghar baithe)\b.{0,70}\b(daily|per day|rozana|earn|income|₹|rs\.?\s?\d)/i,
         /\b(earn|kamaiye|kamao)\b.{0,30}\b(₹|rs\.?\s?\d{3,}|\d{3,}\s?(rupaye|rupees))\b.{0,35}\b(daily|per day|rozana|every day|roz)\b/i,
         /\b(like|rate|rating|review)\b.{0,30}\b(youtube video|hotel|product|task)s?\b.{0,45}\b(earn|commission|paid|money)\b/i,  
         /\bno experience (needed|required)\b.{0,50}\b(whatsapp|contact|join)\b/i,
      ],
   },
   {
      id: 'job-prepaid-task', 
      stage: 'extraction',
      weight: 22,
      floor: 70,
      label: 'The "prepaid task" trap',
      why: 'The signature move of task scams: your balance goes negative, or the next task must be prepaid, and the only way to recover what you are owed is to send more. Nothing is ever paid out.',
      tests: [
         /\bprepaid task\b/i,
         /\b(complete|do|finish)\b.{0,30}\btask\b.{0,50}\b(unlock|withdraw|release|recover)\b/i,
         /\bnegative balance\b/i,
         /\b(commission|earning)s?\b.{0,45}\b(forfeit|frozen|blocked|deposit to (recover|unlock))\b/i,
      ],
   },  
   {
      id: 'loan-harassment',
      stage: 'fear',
      weight: 26,
      floor: 78,
      label: 'Threatens your contacts or photographs',
      why: 'Predatory loan apps harvest your contacts and gallery on install, then threaten to shame you. This is extortion and it is a crime — report it rather than paying.',
      tests: [
         /\bmorph(ed|ing)?\b.{0,35}\b(photo|picture|image)/i,
         /\b(your )?(contacts?|contact list|phone ?book)\b.{0,55}\b(inform|informed|send|share|call|expose|tell)\b/i,
         /\b(send|share|post)\b.{0,45}\b(photo|photograph|picture)s?\b.{0,45}\b(contact|everyone|friend|family|relatives)\b/i,
         /\brecovery (team|agent|boys)\b.{0,45}\b(ghar|home|house|office|address)\b/i,
      ],  
   },
   {
      id: 'imp-new-number',
      stage: 'contact',
      weight: 24,
      floor: 68,
      label: 'Claims to be a relative on a new number',
      why: 'A message from an unknown number claiming to be family, needing money urgently, and discouraging you from calling back is the whole scam in three sentences. Ring the person on the number you already have.',
      tests: [
         /\b(this is|it'?s|its)\b.{0,25}\bmy new number\b/i,
         /\bnew number\b.{0,80}\b(send|transfer|need|urgent|payment)\b.{0,35}\b(money|₹|rs\.?|amount|payment)\b/i,
         /\b(do not|don'?t)\s+(call|phone|ring)\b.{0,45}\b(meeting|busy|can'?t talk|cannot talk)\b/i,
         /\b(hi|hello)\s+(dad|mum|mom|papa|mummy|uncle|aunty)\b.{0,60}\b(new number|phone broke|lost my phone)\b/i,

         /\b(uncle|aunty|dad|papa|mummy|mom)\b.{0,30}\bit'?s? (is )?me\b/i,
         /\bi am in trouble\b.{0,80}\b(send|money|police|officer)\b/i,
         /\b(this is the|i am the) (md|ceo|director|chairman)\b.{0,80}\b(payment|transfer|urgent|confidential)\b/i,
      ],
   },
   {
      id: 'imp-forces-buyer',
      stage: 'contact',
      weight: 22,
      floor: 70,
      label: 'Claims to be armed-forces personnel arranging payment',
      why: 'The "army officer being transferred" story is a standard marketplace scam. Uniform is used to borrow trust, and the payment step always inverts — you end up sending, not receiving.',
      tests: [
         /\b(army|military|defence|defense|navy|air force|crpf|bsf)\b.{0,70}\b(qr|scan|advance|canteen|transfer|posting|transferred)\b/i,
         /\b(army|military) (canteen|unit)\b/i,
      ],
   },
   {
      id: 'inv-guaranteed-returns', 
      stage: 'contact',
      weight: 20,
      floor: 62,
      label: 'Promises guaranteed or extraordinary returns',
      why: 'No legitimate investment guarantees returns, and SEBI-registered advisers are barred from promising them. Guaranteed profit is the oldest tell there is.',
      tests: [
         /\b(guaranteed|assured|fixed|100%)\b.{0,30}\b(returns?|profit|income|earning)/i, 
         /\b\d{2,4}\s?%\s*(returns?|profit|monthly|daily|guaranteed|accuracy)/i,  
         /\b(double|triple|3x|4x)\b.{0,25}\byour (money|investment|capital)\b/i,
         /\b(vip|premium|exclusive)\b.{0,25}\b(stock|trading|investment|profit)\b.{0,20}\bgroup\b/i,
         /\bintraday (call|tip)s?\b.{0,40}\b(accuracy|profit|guaranteed)\b/i,
      ],
   },
   {
      id: 'lot-prize-claim',
      stage: 'contact',
      weight: 20,  
      floor: 62,
      label: 'Tells you that you have won something',
      why: 'You cannot win a lottery you never entered. Every prize scam ends at the same place: a fee, a form, or your bank details.',
      tests: [
         /\byou (have )?(won|win)\b.{0,60}\b(lottery|lucky draw|prize|iphone|₹|rs\.?\s?\d|crore|lakh|car)\b/i,
         /\b(lucky draw|kbc|lottery|bumper draw)\b.{0,50}\b(winner|won|selected|prize|claim)\b/i,  
         /\bcongratulations\b.{0,60}\b(won|winner|selected|prize|lucky)\b/i,
         /\b(बधाई हो|badhai ho)\b.{0,50}(इनाम|लॉटरी|inaam|prize)/i,
      ],
   },
   { 
      id: 'msg-verify-via-link',
      stage: 'control',
      weight: 16,
      label: 'Asks you to confirm bank or identity details through a link',
      why: 'Banks, the tax department and UIDAI never collect account details through a link in a message. Open the official app yourself instead.',
      tests: [
         /\b(verify|confirm|update|validate|re[- ]?enter)\b.{0,45}\b(bank account|account details|card details|kyc|pan|aadhaar)\b.{0,80}(https?:\/\/|link|click)/i,
         /(https?:\/\/)[^\s]{0,80}.{0,60}\b(verify|update|confirm)\b.{0,30}\b(account|details|kyc)\b/i,  
      ],
   },
];

const OFFICIAL_HOSTS = [
   'gov.in', 'nic.in', 'uidai.gov.in', 'cybercrime.gov.in', 'rbi.org.in',  
   'npci.org.in', 'indiapost.gov.in', 'sbi.co.in', 'onlinesbi.sbi',
   'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com', 'pnbindia.in',
   'fedex.com', 'dhl.com', 'bluedart.com', 'amazon.in', 'flipkart.com',
];

export const MESSAGE_PATTERNS = [
   {
      id: 'msg-lookalike-link',  
      stage: 'control',
      weight: 20,
      label: 'Link to a look-alike domain',
      why: 'The address is not the organisation\'s real domain. Look-alike domains are the single most common way credentials are stolen — type the real address yourself instead of tapping.',
      match(text) {
         const urls = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
         for (const url of urls) {
            let host;
            try {
               host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
            } catch {
               continue;
            }  
            const official = OFFICIAL_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
            if (!official) return { evidence: url };
         }
         return null;
      },
   },
   {
      id: 'msg-shortener',
      stage: 'control', 
      weight: 13,
      label: 'Hidden destination behind a short link',
      why: 'Shortened links conceal where you are actually going. No bank or government department sends one.',  
      tests: [/\b(bit\.ly|tinyurl|t\.co|rb\.gy|cutt\.ly|is\.gd|shorturl|rebrand\.ly)\b/i],
   },
   {  
      id: 'msg-personal-callback',
      stage: 'contact',
      weight: 16,
      label: 'Official notice asking you to call a personal mobile',  
      why: 'Government departments, banks and couriers publish landlines and toll-free numbers. A personal 10-digit mobile in an "official" message is the scammer\'s own phone.',
      match(text) {
         const claimsAuthority =
            /\b(customs|police|cyber|fir|court|income tax|electricity board|kyc|bank|department|officer)\b/i.test(
               text,
            );
         if (!claimsAuthority) return null;

         const mobile = text.match(/(?:\+91[\s-]?)?[6-9][\dXx*]{4}[\s-]?[\dXx*]{5}\b/);
         if (!mobile) return null;

         return { evidence: mobile[0] };  
      },
   },
   {
      id: 'msg-account-block',
      stage: 'fear',
      weight: 14,
      label: 'Threatens to block or deactivate your account',
      why: 'Manufactured account emergencies exist to make you act before you check. Banks give written notice and never a same-day ultimatum by SMS.',
      tests: [
         /\b(account|card|sim|connection|service|electricity|power supply|gas|water|broadband)\b.{0,45}\b(will be |is being )?(blocked|block|deactivat|suspend|disconnect|clos|cut off)/i,
         /\b(blocked|deactivated|suspended|disconnected)\b.{0,35}\b(today|tonight|within|immediately|in \d+ hours?)\b/i,
         /\b(खाता|कनेक्शन)\b.{0,30}(बंद|ब्लॉक)/,
      ],
   },
   {
      id: 'msg-update-now', 
      stage: 'extraction',
      weight: 12,
      label: 'Demands you "update" details through the link',
      why: 'KYC, PAN and address updates are never completed through a link in a message. Do them in the bank\'s own app or at a branch.',
      tests: [
         /\b(update|verify|complete|re[- ]?activate)\b.{0,30}\b(now|immediately|today)\b.{0,40}(https?:\/\/|link|click)/i,
         /\b(click|tap)\b.{0,20}\b(here|link|below)\b.{0,40}\b(avoid|prevent|stop|update|verify)\b/i,
         /\bkyc\b.{0,40}\b(update|pending|failed|expired)\b/i,
      ],
   },
];

export const TRUST_SIGNALS = [
   {
      id: 'trust-advisory',

      weight: -35,
      label: 'Fraud-awareness or advisory content',
      tests: [
         /\bbeware of\b/i,
         /\b(never|do not|don'?t) share your\b.{0,40}\b(otp|pin|password|cvv|details)\b/i,
         /\b(no|any) (bank|government agency|official|police officer)\b.{0,45}\bwill (ever|never) ask\b/i,
         /\bwill never ask you\b/i,
         /\breport such (calls|messages|numbers|incidents)\b/i,
         /\b(cyber safety|awareness message|safety tip|public awareness)\b/i,
         /\b(fraudster|scammer)s?\b.{0,40}\b(may|will|often|pretend|impersonate|claim)\b/i,
         /\bin this (training|session|webinar)\b/i,
      ],
   },
   {
      id: 'trust-callback',
      weight: -12,
      label: 'Invites you to call back on an official number',
      tests: [
         /\b(call|contact) us back\b.{0,45}\b(number|website|branch|official|back of your card)\b/i,  
         /\byou can verify this (at|on|with)\b/i,
         /\bvisit your (nearest |home )?branch\b/i,
      ],
   },
   {
      id: 'trust-no-otp',
      weight: -14,
      label: 'Explicitly states it will never ask for an OTP',
      tests: [
         /\bwe (will )?never ask\b.{0,40}\b(otp|pin|password|cvv)\b/i,
         /\bdo not share your (otp|pin|password)\b.{0,30}\b(with anyone|with us)\b/i,  
      ],
   },
   {
      id: 'trust-take-time',
      weight: -10,
      label: 'Encourages you to take your time or consult family',
      tests: [
         /\btake your time\b/i,
         /\b(discuss|check) (this )?with your family\b/i,
         /\bthere'?s no (rush|hurry)\b/i,
         /\byou can think about it\b/i,
      ],
   },
   {
      id: 'trust-optional',
      weight: -8,
      label: 'Makes the action optional and reversible',
      tests: [
         /\bif you'?d like\b/i,
         /\byou (can|may) (decline|ignore|opt out)\b/i, 
         /\bno action is (needed|required)\b/i,
      ],
   },
]; 
