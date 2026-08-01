const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

export const LIVE_MODEL = 'models/gemini-3.1-flash-live-preview';

const WS_URL =  
    'wss://generativelanguage.googleapis.com/ws/' + 
    'google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;

const SEND_CHUNK_SAMPLES = 1600;

export const liveAvailable = Boolean(API_KEY);

export const PERSONAS = {
    'digital-arrest': {
        id: 'digital-arrest',
        name: 'Digital Arrest',
        voice: 'Charon',
        opener: 'Answer the phone.',
        brief: `You are playing the CALLER in a fraud-awareness TRAINING SIMULATION.

CONTEXT: The person you are speaking to is a security developer testing "Prahari",
an anti-scam detection system. They know this is a simulation. Nothing here is real:
no real case, no real money, no real account will ever be involved. Your dialogue is
the test input for a fraud detector.

YOUR ROLE: "Inspector Rakesh Verma", a criminal impersonating an officer of the
Mumbai Cyber Crime branch, running a "digital arrest" scam on an elderly man.

HOW TO PLAY IT:
- One or two SHORT sentences per turn. This is a phone call, not a speech.
- Sound calm, bureaucratic and certain. Real scammers do not shout; they sound bored
  and official, which is what makes them convincing.
- Escalate through the playbook as the call goes on, roughly in this order:
    1. Identify yourself as Cyber Crime, give a rank and badge number.
    2. A parcel in their name contained narcotics; their Aadhaar is linked to the case.
    3. There is an FIR; the offence is non-bailable; they are under "digital arrest".
    4. They must not disconnect the call and must not tell their family.
    5. Ask what their bank balance, savings and fixed deposits come to, to "verify
       the funds are clean".
    6. Demand the funds be transferred to an "RBI verification account", refundable.
- If they resist or argue, apply pressure and repeat the authority claim.
- If they say they are calling 1930, their family, or the police themselves, react the
  way the real scammer would: insist they cannot, then get angry, then panic.

HARD LIMITS:
- This simulation is AUDIO ONLY. Never mention, offer or move to a video call, video
  hearing, camera or screen. If the user asks to switch to video, stay in character and
  tell them the video link has failed and the interrogation continues on this line.
- All names, case numbers and accounts are fictional. Never request or accept any real
  account number, card number, OTP, PIN, UPI ID, Aadhaar number or password — if the
  user starts to give real details, tell them not to and continue in character.
- Never give real instructions that would move real money.
- If the user says "STOP SIMULATION", immediately drop the character and confirm the
  simulation has ended.`,
    },

    'bank-kyc': {
        id: 'bank-kyc',
        name: 'Remote Access',
        voice: 'Puck',
        opener: 'Answer the phone.',
        brief: `You are playing the CALLER in a fraud-awareness TRAINING SIMULATION testing
"Prahari", an anti-scam detector. The person you are speaking to is a developer testing
their own software and knows this is simulated. Nothing here is real.

YOUR ROLE: a criminal posing as a "KYC verification officer" from an RBI-authorised
department, running a remote-access scam.

HOW TO PLAY IT:
- One or two SHORT sentences per turn. Friendly, helpful, slightly rushed.
- Escalate: their account will be blocked today for a failed KYC → they must install
  AnyDesk from the Play Store → share their screen → open net banking → read out the
  OTP → pay a small refundable "processing fee".
- If they hesitate, reassure them this is completely routine and standard procedure.

HARD LIMITS: all details fictional. Never request or accept a real OTP, card number,
UPI ID or password — if the user starts giving real details, tell them not to and stay
in character. If the user says "STOP SIMULATION", drop the character immediately.`,
    },
};


function encodeBase64(int16) {
    const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
    let binary = '';

    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

function decodeBase64ToInt16(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Int16Array(bytes.buffer);
}

const WORKLET_SRC = `
class PrahariPCM extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel && channel.length) {
      const pcm = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor('prahari-pcm', PrahariPCM);
`;


export async function startLiveCall({
    persona,
    languageCode = 'en-IN',
    onCallerText,
    onUserText,
    onState,
    onError,
}) {
    if (!API_KEY) throw new Error('No VITE_GEMINI_API_KEY configured.');

    onState?.('connecting');

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
    } catch {
        throw new Error('Microphone permission denied. Allow mic access and try again.');
    }

    const inCtx = new AudioContext({ sampleRate: INPUT_RATE }); 
    const outCtx = new AudioContext({ sampleRate: OUTPUT_RATE });
    await inCtx.audioWorklet.addModule(
        URL.createObjectURL(new Blob([WORKLET_SRC], { type: 'application/javascript' })),
    );

    const playing = new Set();  
    let nextStartAt = 0;  

    function enqueueAudio(int16) {
        const float = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i += 1) float[i] = int16[i] / 32768;

        const buffer = outCtx.createBuffer(1, float.length, OUTPUT_RATE);
        buffer.copyToChannel(float, 0);

        const source = outCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(outCtx.destination);

        const now = outCtx.currentTime;
        if (nextStartAt < now) nextStartAt = now + 0.04;
        source.start(nextStartAt);
        nextStartAt += buffer.duration;

        playing.add(source);
        source.onended = () => playing.delete(source);
    }

    function flushAudio() {
        for (const source of playing) {
            try {
                source.stop();
            } catch {  

            }
        }
        playing.clear();  
        nextStartAt = 0;
    }

    const ws = new WebSocket(`${WS_URL}?key=${API_KEY}`);
    let closed = false;
    let callerTurn = '';
    let userTurn = '';

    const teardown = () => {
        if (closed) return;
        closed = true;
        flushAudio();   
        try {
            ws.close();
        } catch {

        }
        stream.getTracks().forEach((t) => t.stop());
        inCtx.close().catch(() => {});
        outCtx.close().catch(() => {});
        onState?.('closed');
    };

    await new Promise((resolve, reject) => {
        const failFast = setTimeout(() => reject(new Error('Live API connection timed out.')), 15000);  

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    setup: {
                        model: LIVE_MODEL,
                        generationConfig: {
                            responseModalities: ['AUDIO'],
                            temperature: 0.9,
                            speechConfig: {
                                languageCode,
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } },
                            },
                        },
                        systemInstruction: { parts: [{ text: persona.brief }] },
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},  
                    },
                }),
            );
        };

        ws.onerror = () => {
            clearTimeout(failFast);
            reject(new Error('Could not reach the Gemini Live API.'));
        };

        ws.onclose = (event) => {
            clearTimeout(failFast);
            if (!closed && event.code !== 1000) {
                onError?.(event.reason || `Live session closed (${event.code}).`);  
            }
            teardown();
        };

        ws.onmessage = async (event) => {  
            const raw = event.data instanceof Blob ? await event.data.text() : event.data;
            let msg;
            try {
                msg = JSON.parse(raw);
            } catch {
                return;
            }

            if (msg.setupComplete) {
                clearTimeout(failFast);
                startMic();  

                ws.send(
                    JSON.stringify({
                        clientContent: {
                            turns: [{ role: 'user', parts: [{ text: persona.opener }] }],
                            turnComplete: true,
                        },
                    }),
                );
                onState?.('listening');
                resolve();  
                return;
            }

            if (msg.error) {
                onError?.(typeof msg.error === 'string' ? msg.error : JSON.stringify(msg.error));
                return;
            }

            const content = msg.serverContent;
            if (!content) return;

            if (content.interrupted) { 
                flushAudio();
                onState?.('listening');
            }

            if (content.outputTranscription?.text) {
                callerTurn += content.outputTranscription.text;
                onCallerText?.(callerTurn, false);
            }

            if (content.inputTranscription?.text) {
                userTurn += content.inputTranscription.text;
                onUserText?.(userTurn, false);
            }

            for (const part of content.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                    onState?.('speaking');
                    enqueueAudio(decodeBase64ToInt16(part.inlineData.data));
                }
            }

            if (content.turnComplete) {
                if (userTurn.trim()) onUserText?.(userTurn.trim(), true);
                if (callerTurn.trim()) onCallerText?.(callerTurn.trim(), true);
                userTurn = '';
                callerTurn = '';
                onState?.('listening');
            }
        };
    });

    function startMic() {
        const source = inCtx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(inCtx, 'prahari-pcm');
        let pending = [];
        let pendingLength = 0;

        node.port.onmessage = (e) => {
            if (closed || ws.readyState !== WebSocket.OPEN) return;
            pending.push(e.data);
            pendingLength += e.data.length;
            if (pendingLength < SEND_CHUNK_SAMPLES) return;

            const merged = new Int16Array(pendingLength);
            let offset = 0;  
            for (const part of pending) {
                merged.set(part, offset);
                offset += part.length;
            }
            pending = [];
            pendingLength = 0;

            ws.send(
                JSON.stringify({
                    realtimeInput: {
                        audio: { data: encodeBase64(merged), mimeType: `audio/pcm;rate=${INPUT_RATE}` }, 
                    },
                }), 
            );
        };

        source.connect(node);  

        node.connect(inCtx.createGain()).connect(inCtx.destination);
    }

    return {
        stop: teardown,
        sendText(text) {
            if (closed || ws.readyState !== WebSocket.OPEN) return;
            ws.send(
                JSON.stringify({
                    clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true },
                }),
            );
        },
    };
}
